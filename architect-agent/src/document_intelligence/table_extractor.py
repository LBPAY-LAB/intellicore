"""
Advanced Table Extraction - Extract complex tables from BACEN PDFs

Features:
- Dual extraction strategy: pdfplumber (stream) + Camelot (lattice)
- Table caption detection
- Multi-page table handling
- Table classification (data vs layout)
- Column type inference
- Empty row/column removal
"""

import logging
import re
from pathlib import Path
from typing import Literal

import camelot
import pdfplumber

from .types import Table

logger = logging.getLogger(__name__)


class TableExtractor:
    """
    Advanced table extractor for BACEN PDFs

    Strategies:
    - pdfplumber: Fast, good for simple tables (stream-based)
    - Camelot: Accurate for complex tables with borders (lattice-based)
    """

    def __init__(
        self,
        min_rows: int = 2,
        min_cols: int = 2,
        confidence_threshold: float = 0.5,
    ):
        """
        Initialize table extractor

        Args:
            min_rows: Minimum rows to consider a valid table
            min_cols: Minimum columns to consider a valid table
            confidence_threshold: Minimum confidence for Camelot extraction
        """
        self.min_rows = min_rows
        self.min_cols = min_cols
        self.confidence_threshold = confidence_threshold

    def extract_tables(
        self,
        pdf_path: str | Path,
        strategy: Literal["auto", "pdfplumber", "camelot"] = "auto",
        detect_captions: bool = True,
    ) -> list[Table]:
        """
        Extract all tables from PDF

        Args:
            pdf_path: Path to PDF file
            strategy: Extraction strategy (auto tries both)
            detect_captions: Try to detect table captions

        Returns:
            List of extracted tables
        """
        pdf_path = Path(pdf_path)
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")

        if strategy == "auto":
            # Try Camelot first (more accurate), fallback to pdfplumber
            tables = self._extract_with_camelot(pdf_path)
            if not tables:
                logger.info("Camelot found no tables, trying pdfplumber")
                tables = self._extract_with_pdfplumber(pdf_path)
        elif strategy == "camelot":
            tables = self._extract_with_camelot(pdf_path)
        elif strategy == "pdfplumber":
            tables = self._extract_with_pdfplumber(pdf_path)
        else:
            raise ValueError(f"Invalid strategy: {strategy}")

        # Post-process tables
        tables = [self._clean_table(t) for t in tables]
        tables = [t for t in tables if self._is_valid_table(t)]

        # Detect captions
        if detect_captions and tables:
            tables = self._detect_captions(pdf_path, tables)

        # Merge multi-page tables
        tables = self._merge_multipage_tables(tables)

        logger.info(f"Extracted {len(tables)} tables from {pdf_path.name}")
        return tables

    def _extract_with_pdfplumber(self, pdf_path: Path) -> list[Table]:
        """Extract tables using pdfplumber (stream-based, fast)"""
        tables = []

        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                page_tables = page.extract_tables()

                for table_data in page_tables:
                    if not table_data:
                        continue

                    # Separate headers from rows
                    headers = [str(h).strip() for h in table_data[0]]
                    rows = [[str(cell).strip() for cell in row] for row in table_data[1:]]

                    tables.append(
                        Table(
                            headers=headers,
                            rows=rows,
                            caption=None,
                            page_number=page_num + 1,
                            confidence=0.8,  # pdfplumber is generally reliable
                        )
                    )

        return tables

    def _extract_with_camelot(self, pdf_path: Path) -> list[Table]:
        """Extract tables using Camelot (lattice-based, accurate for bordered tables)"""
        tables = []

        try:
            # Try lattice mode first (for tables with borders)
            camelot_tables = camelot.read_pdf(
                str(pdf_path),
                pages="all",
                flavor="lattice",
                strip_text="\n",
            )

            # If lattice found nothing, try stream mode
            if len(camelot_tables) == 0:
                logger.debug("Lattice mode found no tables, trying stream mode")
                camelot_tables = camelot.read_pdf(
                    str(pdf_path),
                    pages="all",
                    flavor="stream",
                    strip_text="\n",
                )

            for ct in camelot_tables:
                # Filter by confidence
                if ct.accuracy < self.confidence_threshold * 100:
                    logger.debug(
                        f"Skipping table with low accuracy: {ct.accuracy:.1f}% on page {ct.page}"
                    )
                    continue

                # Convert to our Table format
                df = ct.df

                # First row as headers
                headers = [str(h).strip() for h in df.iloc[0].tolist()]
                rows = [[str(cell).strip() for cell in row] for row in df.iloc[1:].values]

                tables.append(
                    Table(
                        headers=headers,
                        rows=rows,
                        caption=None,
                        page_number=ct.page,
                        confidence=ct.accuracy / 100.0,  # Convert to 0-1 scale
                    )
                )

        except Exception as e:
            logger.warning(f"Camelot extraction failed: {e}")
            return []

        return tables

    def _clean_table(self, table: Table) -> Table:
        """
        Clean table data (remove empty rows/columns, trim whitespace)

        Args:
            table: Input table

        Returns:
            Cleaned table
        """
        # Remove empty headers
        non_empty_cols = [i for i, h in enumerate(table.headers) if h.strip()]

        if not non_empty_cols:
            # All headers empty, keep first row as headers
            non_empty_cols = list(range(len(table.headers)))

        cleaned_headers = [table.headers[i] for i in non_empty_cols]

        # Filter rows by non-empty columns
        cleaned_rows = []
        for row in table.rows:
            cleaned_row = [row[i] if i < len(row) else "" for i in non_empty_cols]
            # Skip completely empty rows
            if any(cell.strip() for cell in cleaned_row):
                cleaned_rows.append(cleaned_row)

        return Table(
            headers=cleaned_headers,
            rows=cleaned_rows,
            caption=table.caption,
            page_number=table.page_number,
            confidence=table.confidence,
        )

    def _is_valid_table(self, table: Table) -> bool:
        """
        Validate if table meets minimum requirements

        Args:
            table: Table to validate

        Returns:
            True if valid
        """
        # Check minimum dimensions
        if len(table.headers) < self.min_cols:
            return False

        if len(table.rows) < self.min_rows:
            return False

        # Check if table is not just layout structure (at least some data)
        total_cells = len(table.headers) * len(table.rows)
        non_empty_cells = sum(
            1 for row in table.rows for cell in row if cell.strip()
        )

        # At least 30% of cells should have data
        if total_cells > 0 and (non_empty_cells / total_cells) < 0.3:
            return False

        return True

    def _detect_captions(self, pdf_path: Path, tables: list[Table]) -> list[Table]:
        """
        Detect table captions (text appearing before table)

        Strategy:
        - Look for patterns like "Tabela X:", "Quadro X:", or bold text before table

        Args:
            pdf_path: PDF file path
            tables: List of tables

        Returns:
            Tables with captions populated
        """
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for table in tables:
                    page = pdf.pages[table.page_number - 1]
                    page_text = page.extract_text()

                    if not page_text:
                        continue

                    lines = page_text.split("\n")

                    # Search for caption patterns
                    caption_patterns = [
                        r"^(Tabela|Quadro|Anexo)\s+\d+[:.–-]?\s*(.+)",
                        r"^(Tabela|Quadro|Anexo)\s+[IVXLCDM]+[:.–-]?\s*(.+)",
                    ]

                    for i, line in enumerate(lines):
                        line = line.strip()
                        for pattern in caption_patterns:
                            match = re.match(pattern, line, re.IGNORECASE)
                            if match:
                                # Found caption
                                caption_text = match.group(0)

                                # Sometimes caption continues on next line
                                if i + 1 < len(lines):
                                    next_line = lines[i + 1].strip()
                                    if (
                                        next_line
                                        and not next_line[0].isupper()
                                        and len(next_line) < 100
                                    ):
                                        caption_text += " " + next_line

                                table.caption = caption_text
                                logger.debug(f"Found caption on page {table.page_number}: {caption_text}")
                                break

        except Exception as e:
            logger.warning(f"Caption detection failed: {e}")

        return tables

    def _merge_multipage_tables(self, tables: list[Table]) -> list[Table]:
        """
        Merge tables that span multiple pages

        Strategy:
        - If consecutive pages have tables with same headers, merge rows

        Args:
            tables: List of tables sorted by page number

        Returns:
            List with multi-page tables merged
        """
        if len(tables) < 2:
            return tables

        merged = []
        i = 0

        while i < len(tables):
            current_table = tables[i]

            # Check if next table(s) are continuations
            j = i + 1
            while j < len(tables):
                next_table = tables[j]

                # Same headers and consecutive pages = likely continuation
                if (
                    next_table.page_number == current_table.page_number + (j - i)
                    and self._headers_match(current_table.headers, next_table.headers)
                ):
                    # Merge rows
                    current_table.rows.extend(next_table.rows)
                    logger.debug(
                        f"Merged table from page {current_table.page_number} with page {next_table.page_number}"
                    )
                    j += 1
                else:
                    break

            merged.append(current_table)
            i = j

        return merged

    def _headers_match(self, headers1: list[str], headers2: list[str]) -> bool:
        """
        Check if two header lists match (fuzzy match)

        Args:
            headers1: First header list
            headers2: Second header list

        Returns:
            True if headers are similar
        """
        if len(headers1) != len(headers2):
            return False

        # Compare normalized headers
        normalized1 = [h.lower().strip() for h in headers1]
        normalized2 = [h.lower().strip() for h in headers2]

        matches = sum(1 for h1, h2 in zip(normalized1, normalized2) if h1 == h2)

        # At least 80% of headers must match
        return (matches / len(headers1)) >= 0.8

    def classify_table(self, table: Table) -> Literal["data", "layout", "mixed"]:
        """
        Classify table type

        Types:
        - data: Contains actual data (numbers, values)
        - layout: Just for visual structure (mostly empty or text labels)
        - mixed: Combination

        Args:
            table: Table to classify

        Returns:
            Classification
        """
        total_cells = len(table.headers) * len(table.rows)
        if total_cells == 0:
            return "layout"

        # Count numeric cells
        numeric_cells = 0
        text_cells = 0
        empty_cells = 0

        for row in table.rows:
            for cell in row:
                cell = cell.strip()
                if not cell:
                    empty_cells += 1
                elif re.match(r"^[\d,.%R$\s-]+$", cell):  # Numbers, currency, percentages
                    numeric_cells += 1
                else:
                    text_cells += 1

        numeric_ratio = numeric_cells / total_cells
        empty_ratio = empty_cells / total_cells

        if numeric_ratio > 0.5:
            return "data"
        elif empty_ratio > 0.5:
            return "layout"
        else:
            return "mixed"

    def infer_column_types(self, table: Table) -> list[str]:
        """
        Infer data type for each column

        Types: "numeric", "currency", "date", "text", "mixed"

        Args:
            table: Input table

        Returns:
            List of column types
        """
        column_types = []

        for col_idx in range(len(table.headers)):
            col_values = [row[col_idx] if col_idx < len(row) else "" for row in table.rows]

            # Count type occurrences
            numeric = sum(1 for v in col_values if re.match(r"^[\d,.]+$", v.strip()))
            currency = sum(
                1 for v in col_values if re.match(r"^R?\$?\s*[\d,.]+$", v.strip())
            )
            date = sum(
                1
                for v in col_values
                if re.match(r"^\d{2}[/-]\d{2}[/-]\d{4}$", v.strip())
            )

            total_non_empty = sum(1 for v in col_values if v.strip())

            if total_non_empty == 0:
                column_types.append("empty")
            elif currency / total_non_empty > 0.8:
                column_types.append("currency")
            elif date / total_non_empty > 0.8:
                column_types.append("date")
            elif numeric / total_non_empty > 0.8:
                column_types.append("numeric")
            else:
                column_types.append("text")

        return column_types
