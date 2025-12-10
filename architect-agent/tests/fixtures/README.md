# Test Fixtures

This directory contains sample BACEN PDF documents for testing the Document Intelligence Engine.

## Required Fixtures

To run integration tests, add the following BACEN PDF files:

1. **sample_circular.pdf** - A BACEN Circular (e.g., Circular 3.978 on PLD/FT)
2. **sample_resolucao.pdf** - A BACEN Resolution (e.g., Resolução 4.753 on KYC)
3. **sample_manual.pdf** - A BACEN Manual (e.g., Manual de Normas do PIX)
4. **sample_scanned.pdf** - A scanned PDF document (for OCR testing)

## How to Obtain Fixtures

Download real BACEN normative documents from:
- https://www.bcb.gov.br/estabilidadefinanceira/buscanormas
- https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix.pdf

## Running Tests Without Fixtures

If fixtures are not available, integration tests will be automatically skipped using `pytest.skip()`.

Unit tests (which don't require PDF files) will still run successfully.

## Security Note

**DO NOT commit real BACEN PDFs to the repository** if they contain sensitive or proprietary information.

Instead:
1. Add `*.pdf` to `.gitignore`
2. Document where to download the files
3. Provide scripts to automatically download public BACEN documents
