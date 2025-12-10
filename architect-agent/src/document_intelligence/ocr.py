"""
OCR Module - Advanced Optical Character Recognition for scanned PDFs

Features:
- Tesseract OCR integration
- Image preprocessing (deskewing, denoising, contrast enhancement)
- Language detection
- Confidence scoring per page
- Multi-language support (Portuguese + English)
"""

import logging
from pathlib import Path
from typing import Literal

import cv2
import numpy as np
import pytesseract
from PIL import Image

logger = logging.getLogger(__name__)


class OCREngine:
    """
    Advanced OCR engine with image preprocessing

    Capabilities:
    - Automatic image quality enhancement
    - Deskewing (rotation correction)
    - Noise removal
    - Contrast adjustment
    - Multi-language text extraction
    """

    def __init__(
        self,
        primary_lang: str = "por",
        fallback_lang: str = "eng",
        min_confidence: float = 60.0,
    ):
        """
        Initialize OCR engine

        Args:
            primary_lang: Primary language for OCR (default: "por" for Portuguese)
            fallback_lang: Fallback language if primary fails (default: "eng")
            min_confidence: Minimum confidence threshold (0-100)
        """
        self.primary_lang = primary_lang
        self.fallback_lang = fallback_lang
        self.min_confidence = min_confidence

        # Verify Tesseract installation
        try:
            pytesseract.get_tesseract_version()
        except Exception as e:
            logger.error(f"Tesseract not found or not configured: {e}")
            raise RuntimeError("Tesseract OCR is not installed or not in PATH")

    def extract_text(
        self,
        image: Image.Image | np.ndarray,
        preprocess: bool = True,
        detect_language: bool = False,
    ) -> dict:
        """
        Extract text from image with OCR

        Args:
            image: PIL Image or numpy array
            preprocess: Apply image preprocessing (recommended)
            detect_language: Auto-detect language before OCR

        Returns:
            dict with:
                - text: Extracted text
                - confidence: Average confidence score (0-100)
                - language: Detected/used language
                - word_count: Number of words extracted
        """
        # Convert PIL Image to numpy array if needed
        if isinstance(image, Image.Image):
            image = np.array(image)

        # Preprocess image for better OCR results
        if preprocess:
            image = self._preprocess_image(image)

        # Detect language if requested
        lang = self.primary_lang
        if detect_language:
            detected_lang = self._detect_language(image)
            if detected_lang:
                lang = detected_lang
                logger.info(f"Detected language: {lang}")

        # Perform OCR with detailed output
        try:
            ocr_data = pytesseract.image_to_data(
                image, lang=lang, output_type=pytesseract.Output.DICT
            )

            # Extract text and calculate confidence
            text_parts = []
            confidences = []

            for i, conf in enumerate(ocr_data["conf"]):
                text = ocr_data["text"][i]
                if conf > 0 and text.strip():  # Valid word
                    text_parts.append(text)
                    confidences.append(float(conf))

            extracted_text = " ".join(text_parts)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

            # Try fallback language if confidence is too low
            if avg_confidence < self.min_confidence and lang != self.fallback_lang:
                logger.warning(
                    f"Low confidence ({avg_confidence:.1f}%), trying fallback language"
                )
                return self.extract_text(image, preprocess=False, detect_language=False)

            return {
                "text": extracted_text,
                "confidence": round(avg_confidence, 2),
                "language": lang,
                "word_count": len(text_parts),
                "success": avg_confidence >= self.min_confidence,
            }

        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            return {
                "text": "",
                "confidence": 0.0,
                "language": lang,
                "word_count": 0,
                "success": False,
                "error": str(e),
            }

    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """
        Apply image preprocessing pipeline for better OCR

        Steps:
        1. Convert to grayscale
        2. Deskew (rotation correction)
        3. Denoise
        4. Increase contrast
        5. Binarization (Otsu's method)

        Args:
            image: Input image as numpy array

        Returns:
            Preprocessed image
        """
        # 1. Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        else:
            gray = image.copy()

        # 2. Deskew
        gray = self._deskew(gray)

        # 3. Denoise
        gray = cv2.fastNlMeansDenoising(gray, h=10)

        # 4. Increase contrast (CLAHE - Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        gray = clahe.apply(gray)

        # 5. Binarization (Otsu's method)
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        return binary

    def _deskew(self, image: np.ndarray) -> np.ndarray:
        """
        Deskew image (correct rotation)

        Uses Hough Line Transform to detect text orientation and rotate accordingly

        Args:
            image: Grayscale image

        Returns:
            Deskewed image
        """
        # Detect edges
        edges = cv2.Canny(image, 50, 150, apertureSize=3)

        # Detect lines using Hough Transform
        lines = cv2.HoughLines(edges, 1, np.pi / 180, 200)

        if lines is None:
            return image  # No lines detected, return original

        # Calculate average angle
        angles = []
        for rho, theta in lines[:, 0]:
            angle = np.degrees(theta) - 90
            angles.append(angle)

        median_angle = np.median(angles) if angles else 0

        # Only rotate if angle is significant (> 0.5 degrees)
        if abs(median_angle) > 0.5:
            # Rotate image
            (h, w) = image.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
            rotated = cv2.warpAffine(
                image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
            )
            logger.debug(f"Deskewed image by {median_angle:.2f} degrees")
            return rotated

        return image

    def _detect_language(self, image: np.ndarray) -> str | None:
        """
        Detect language in image using OSD (Orientation and Script Detection)

        Args:
            image: Input image

        Returns:
            Detected language code or None
        """
        try:
            osd_data = pytesseract.image_to_osd(image, output_type=pytesseract.Output.DICT)
            script = osd_data.get("script", "")

            # Map script to language
            script_to_lang = {
                "Latin": self.primary_lang,  # Assume Portuguese for Latin script
                "Common": self.primary_lang,
            }

            return script_to_lang.get(script, None)

        except Exception as e:
            logger.warning(f"Language detection failed: {e}")
            return None

    def extract_text_from_file(
        self, file_path: str | Path, preprocess: bool = True
    ) -> dict:
        """
        Extract text from image file

        Args:
            file_path: Path to image file (PNG, JPG, TIFF, etc.)
            preprocess: Apply preprocessing

        Returns:
            OCR result dict (same as extract_text)
        """
        file_path = Path(file_path)
        if not file_path.exists():
            raise FileNotFoundError(f"Image file not found: {file_path}")

        try:
            image = Image.open(file_path)
            return self.extract_text(image, preprocess=preprocess)
        except Exception as e:
            logger.error(f"Failed to process image file {file_path}: {e}")
            return {
                "text": "",
                "confidence": 0.0,
                "language": self.primary_lang,
                "word_count": 0,
                "success": False,
                "error": str(e),
            }

    def is_scanned_page(
        self, image: Image.Image | np.ndarray, text_threshold: int = 100
    ) -> bool:
        """
        Detect if page is scanned (image-based) vs text-based PDF

        Args:
            image: Page image
            text_threshold: Minimum text length to consider non-scanned

        Returns:
            True if page appears to be scanned
        """
        # Quick OCR without preprocessing
        result = self.extract_text(image, preprocess=False, detect_language=False)

        # If extracted text is too short, likely scanned
        return len(result["text"]) < text_threshold


# Convenience function
def extract_text_from_image(
    image: Image.Image | np.ndarray,
    lang: str = "por",
    preprocess: bool = True,
) -> str:
    """
    Quick OCR extraction (simple interface)

    Args:
        image: Input image
        lang: Language code
        preprocess: Apply preprocessing

    Returns:
        Extracted text string
    """
    engine = OCREngine(primary_lang=lang)
    result = engine.extract_text(image, preprocess=preprocess)
    return result["text"]
