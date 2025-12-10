"""
BACEN Document Parser - Extracts structured data from BACEN PDFs

Uses PyMuPDF for text extraction, pdfplumber for tables, and Tesseract for OCR.
"""

import re
from pathlib import Path
from typing import Any

import fitz  # PyMuPDF
import pdfplumber
import pytesseract
from PIL import Image

from .types import (
    DocumentMetadata,
    DocumentStructure,
    DocumentType,
    Section,
    SectionType,
    Table,
)


class BACENDocumentParser:
    """
    Parse BACEN documents (PDFs) into structured format

    Features:
    - Text extraction with PyMuPDF
    - Table extraction with pdfplumber
    - OCR for scanned PDFs with Tesseract
    - Hierarchical section detection
    - Metadata extraction
    """

    def __init__(self, ocr_language: str = "por"):
        """
        Initialize parser

        Args:
            ocr_language: Tesseract OCR language (default: "por" for Portuguese)
        """
        self.ocr_language = ocr_language

    def parse(self, pdf_path: str | Path) -> DocumentStructure:
        """
        Parse BACEN PDF into structured document

        Args:
            pdf_path: Path to PDF file

        Returns:
            DocumentStructure with metadata, sections, and tables

        Raises:
            FileNotFoundError: If PDF file not found
            ValueError: If PDF is empty or invalid
        """
        pdf_path = Path(pdf_path)
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")

        # 1. Extract metadata
        metadata = self._extract_metadata(pdf_path)

        # 2. Extract full text (with OCR fallback)
        full_text = self._extract_text(pdf_path)

        # 3. Extract tables
        tables = self._extract_tables(pdf_path)

        # 4. Detect hierarchical structure
        sections = self._extract_sections(full_text, tables)

        # 5. Calculate confidence score
        confidence = self._calculate_confidence(full_text, sections, tables)

        return DocumentStructure(
            metadata=metadata,
            sections=sections,
            full_text=full_text,
            tables=tables,
            confidence_score=confidence,
        )

    def _extract_metadata(self, pdf_path: Path) -> DocumentMetadata:
        """
        Extract metadata from PDF

        Args:
            pdf_path: Path to PDF file

        Returns:
            DocumentMetadata with title, type, dates, etc
        """
        doc = fitz.open(pdf_path)
        pdf_metadata = doc.metadata

        # Extract from PDF metadata
        title = pdf_metadata.get("title", pdf_path.stem)
        subject = pdf_metadata.get("subject", "")

        # Detect document type from title/subject
        document_type = self._detect_document_type(title, subject)

        # Extract numero normativo (e.g., "Circular 3.978")
        numero_normativo = self._extract_numero_normativo(title)

        # Try to extract dates from first page
        first_page_text = doc[0].get_text()
        data_publicacao = self._extract_date(first_page_text, "publicação")
        data_vigencia = self._extract_date(first_page_text, "vigência")

        doc.close()

        return DocumentMetadata(
            title=title,
            document_type=document_type,
            numero_normativo=numero_normativo,
            data_publicacao=data_publicacao,
            data_vigencia=data_vigencia,
            assunto=subject or None,
            total_pages=len(doc),
        )

    def _extract_text(self, pdf_path: Path) -> str:
        """
        Extract text from PDF (with OCR fallback for scanned PDFs)

        Args:
            pdf_path: Path to PDF file

        Returns:
            Extracted text
        """
        doc = fitz.open(pdf_path)
        full_text = ""

        for page_num, page in enumerate(doc):
            # Try normal text extraction
            text = page.get_text()

            # If text is too short (scanned PDF), use OCR
            if len(text.strip()) < 100:
                pix = page.get_pixmap()
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                text = pytesseract.image_to_string(img, lang=self.ocr_language)

            full_text += f"\n--- Página {page_num + 1} ---\n{text}"

        doc.close()
        return full_text

    def _extract_tables(self, pdf_path: Path) -> list[Table]:
        """
        Extract tables from PDF using pdfplumber

        Args:
            pdf_path: Path to PDF file

        Returns:
            List of extracted tables
        """
        tables: list[Table] = []

        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                page_tables = page.extract_tables()

                for table_data in page_tables:
                    if not table_data or len(table_data) < 2:
                        continue

                    # First row is usually headers
                    headers = [str(h).strip() for h in table_data[0]]
                    rows = [[str(cell).strip() for cell in row] for row in table_data[1:]]

                    # Try to find caption (text above table)
                    caption = None
                    # TODO: Implement caption detection

                    tables.append(
                        Table(
                            headers=headers,
                            rows=rows,
                            caption=caption,
                            page_number=page_num + 1,
                            confidence=0.9,  # High confidence for pdfplumber
                        )
                    )

        return tables

    def _extract_sections(self, full_text: str, tables: list[Table]) -> list[Section]:
        """
        Detect hierarchical structure (chapters, sections, subsections)

        Args:
            full_text: Full extracted text
            tables: Extracted tables

        Returns:
            List of top-level sections
        """
        lines = full_text.split("\n")
        sections: list[Section] = []
        current_chapter: Section | None = None
        current_section: Section | None = None

        for line in lines:
            line = line.strip()
            if not line or line.startswith("---"):
                continue

            # Detect chapter (e.g., "CAPÍTULO I", "1. ", "I. ")
            if self._is_chapter(line):
                current_chapter = Section(
                    type=SectionType.CHAPTER,
                    title=line,
                    content="",
                    level=1,
                    page_number=0,  # TODO: Extract page number
                )
                sections.append(current_chapter)
                current_section = None
                continue

            # Detect section (e.g., "1.1 ", "a) ")
            if self._is_section(line):
                current_section = Section(
                    type=SectionType.SECTION,
                    title=line,
                    content="",
                    level=2,
                    page_number=0,
                )
                if current_chapter:
                    current_chapter.subsections.append(current_section)
                else:
                    sections.append(current_section)
                continue

            # Detect requirement (e.g., "i. ", "- ")
            if self._is_requirement(line):
                requirement = Section(
                    type=SectionType.REQUIREMENT,
                    title="",
                    content=line,
                    level=3,
                    page_number=0,
                )
                if current_section:
                    current_section.subsections.append(requirement)
                elif current_chapter:
                    current_chapter.subsections.append(requirement)
                continue

            # Regular content
            if current_section:
                current_section.content += line + " "
            elif current_chapter:
                current_chapter.content += line + " "

        # Assign tables to sections (based on page number proximity)
        # TODO: Implement table assignment

        return sections

    def _detect_document_type(self, title: str, subject: str) -> DocumentType:
        """Detect document type from title/subject"""
        text = f"{title} {subject}".lower()

        if "circular" in text:
            return DocumentType.CIRCULAR
        elif "resolução" in text or "resolucao" in text:
            return DocumentType.RESOLUCAO
        elif "manual" in text:
            return DocumentType.MANUAL
        else:
            return DocumentType.NORMATIVO

    def _extract_numero_normativo(self, title: str) -> str | None:
        """Extract normativo number (e.g., '3978' from 'Circular 3.978')"""
        match = re.search(r"\b(\d+[\.,]?\d*)\b", title)
        return match.group(1).replace(".", "") if match else None

    def _extract_date(self, text: str, keyword: str) -> str | None:
        """Extract date near keyword (e.g., 'publicação', 'vigência')"""
        # Look for dates in format dd/mm/yyyy or yyyy-mm-dd
        pattern = r"\b(\d{2}[/-]\d{2}[/-]\d{4}|\d{4}[/-]\d{2}[/-]\d{2})\b"
        matches = re.finditer(pattern, text)

        for match in matches:
            # Check if keyword appears within 50 chars before the date
            start = max(0, match.start() - 50)
            context = text[start : match.start()]
            if keyword.lower() in context.lower():
                date_str = match.group(1)
                # Convert to ISO format (yyyy-mm-dd)
                if "/" in date_str:
                    parts = date_str.split("/")
                    if len(parts[0]) == 2:  # dd/mm/yyyy
                        return f"{parts[2]}-{parts[1]}-{parts[0]}"
                    else:  # yyyy/mm/dd
                        return date_str.replace("/", "-")
                return date_str

        return None

    def _is_chapter(self, line: str) -> bool:
        """Check if line is a chapter heading"""
        return bool(
            re.match(r"^(CAPÍTULO|CAPÍTULO)\s+[IVX]+", line, re.IGNORECASE)
            or re.match(r"^\d+\.\s+[A-Z]", line)
        )

    def _is_section(self, line: str) -> bool:
        """Check if line is a section heading"""
        return bool(re.match(r"^\d+\.\d+", line) or re.match(r"^[a-z]\)", line))

    def _is_requirement(self, line: str) -> bool:
        """Check if line is a requirement/list item"""
        return bool(
            re.match(r"^[ivx]+\.", line, re.IGNORECASE)
            or re.match(r"^[-•]\s+", line)
            or re.match(r"^\(\d+\)", line)
        )

    def _calculate_confidence(
        self, full_text: str, sections: list[Section], tables: list[Table]
    ) -> float:
        """
        Calculate confidence score based on extraction quality

        Args:
            full_text: Extracted text
            sections: Extracted sections
            tables: Extracted tables

        Returns:
            Confidence score (0.0 to 1.0)
        """
        score = 1.0

        # Penalize if text is too short (likely OCR issues)
        if len(full_text) < 500:
            score -= 0.3

        # Penalize if no sections detected
        if not sections:
            score -= 0.2

        # Bonus for tables found
        if tables:
            score = min(1.0, score + 0.1)

        return max(0.0, score)
