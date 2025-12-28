# Document Upload Interface Wireframe

**Screen**: Document Upload & Knowledge Ingestion  
**Stack**: Next.js 14 + shadcn/ui + react-dropzone + i18next  
**Purpose**: Upload documents to Oracle knowledge base (RF002, RF003, RF041)

## Overview

This interface allows users to upload multimodal content (PDFs, docs, images, videos, URLs) that will be processed, chunked, embedded, and added to the Oracle knowledge graph.

---

## 1. Upload Screen - Main View

### Layout
```
┌────────────────────────────────────────────────────────────────┐
│ [Icon] Banking Hub → Conhecimento → Upload                     │
│                                                                │
│ Upload de Documentos                                           │
│ Adicione conhecimento ao Oráculo para geração automática      │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │                                                          │  │
│ │         📤                                               │  │
│ │                                                          │  │
│ │    Arraste arquivos aqui ou clique para selecionar      │  │
│ │                                                          │  │
│ │    Formatos suportados: PDF, DOCX, TXT, MD, HTML,       │  │
│ │    XLSX, PNG, JPG, MP4, MP3, URLs                       │  │
│ │                                                          │  │
│ │    Tamanho máximo: 100MB por arquivo                    │  │
│ │                                                          │  │
│ │                  [Selecionar Arquivos]                   │  │
│ │                                                          │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│ ─────────────────────── ou ──────────────────────────         │
│                                                                │
│ Upload via URL                                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ https://example.com/documentation.pdf                    │  │
│ │ [_______________________________________________] [Add]    │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│ Arquivos Selecionados (3)                                     │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 📄 BACEN_Resolution_4753.pdf        [x] Remove           │  │
│ │    2.5 MB | PDF                                          │  │
│ │    ┌──────────────────────────────────────────────────┐  │  │
│ │    │ Processing Options:                              │  │  │
│ │    │ [x] OCR (for scanned documents)                  │  │  │
│ │    │ [x] Extract tables                               │  │  │
│ │    │ [ ] Extract images                               │  │  │
│ │    └──────────────────────────────────────────────────┘  │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ 📊 Customer_Data.xlsx               [x] Remove           │  │
│ │    850 KB | Excel                                        │  │
│ │    [x] Import as structured data                        │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ 🎥 Onboarding_Tutorial.mp4          [x] Remove           │  │
│ │    45 MB | Video                                         │  │
│ │    [x] Generate transcript (PT-BR via Whisper)          │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│ Metadata (opcional)                                            │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Categoria: [Select: Regulation, Policy, Documentation]  │  │
│ │ Tags: [banking, compliance, onboarding_______]          │  │
│ │ Source: [BACEN Official_______________________]         │  │
│ │ Version: [1.0_____]                                     │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│                               [Cancelar] [Iniciar Upload]     │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Upload Progress Screen

### Layout
```
┌────────────────────────────────────────────────────────────────┐
│ Upload em Progresso                                             │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 📄 BACEN_Resolution_4753.pdf                             │  │
│ │                                                          │  │
│ │ [████████████████████░░░░] 75%                          │  │
│ │                                                          │  │
│ │ Uploading... 1.9 MB / 2.5 MB                            │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 📊 Customer_Data.xlsx                                    │  │
│ │                                                          │  │
│ │ [████████████████████████] ✓ Uploaded                   │  │
│ │                                                          │  │
│ │ Processing: Extracting data... (Step 1/3)               │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 🎥 Onboarding_Tutorial.mp4                               │  │
│ │                                                          │  │
│ │ [░░░░░░░░░░░░░░░░░░░░░░░░] 0% (Queued)                  │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│ Overall Progress: 2/3 arquivos                                 │
│ Estimated time: 2 minutos                                      │
│                                                                │
│                                       [Cancelar Upload]        │
└────────────────────────────────────────────────────────────────┘
```

### Processing Steps (shown per file):
1. **Upload**: Transfer to server/MinIO
2. **Processing**: 
   - PDF: OCR, text extraction, table extraction
   - Excel: Parse rows, import as structured data
   - Video: Transcription with Whisper
   - Image: OCR, object detection
3. **Chunking**: Semantic chunking (not by characters)
4. **Embedding**: Generate vector embeddings
5. **Indexing**: Store in PostgreSQL + NebulaGraph + pgvector

---

## 3. Processing Complete Screen

### Layout
```
┌────────────────────────────────────────────────────────────────┐
│ ✓ Upload Concluído\!                                            │
│                                                                │
│ 3 arquivos processados com sucesso                            │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ ✓ BACEN_Resolution_4753.pdf                              │  │
│ │   • 45 chunks criados                                    │  │
│ │   • 12 entidades extraídas                               │  │
│ │   • 8 relações identificadas                             │  │
│ │   [Ver no Knowledge Graph]                               │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ ✓ Customer_Data.xlsx                                     │  │
│ │   • 1,250 linhas importadas                              │  │
│ │   • 8 colunas mapeadas                                   │  │
│ │   [Ver Dados]                                            │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ ✓ Onboarding_Tutorial.mp4                                │  │
│ │   • Transcript gerado (12 páginas)                       │  │
│ │   • 30 chunks criados                                    │  │
│ │   [Ver Transcript]                                       │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│ Próximos Passos:                                               │
│ • Revisar conhecimento adicionado                             │
│ • Gerar Object Definitions com base neste conhecimento        │
│ • Testar consultas RAG                                         │
│                                                                │
│              [Upload Mais] [Ver Knowledge Graph] [Concluir]   │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Document Library (Already Uploaded)

### Layout
```
┌────────────────────────────────────────────────────────────────┐
│ [Icon] Banking Hub → Conhecimento → Biblioteca                 │
│                                                                │
│ Documentos no Oráculo (127)               [+ Upload] [🔍]     │
│                                                                │
│ [Search...] [Filter: Type ▼] [Category ▼] [Sort: Date ▼]     │
│                                                                │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 📄 BACEN_Resolution_4753.pdf                             │  │
│ │ Uploaded: 2024-12-20 | Category: Regulation              │  │
│ │ 45 chunks | 12 entities | 8 relations                    │  │
│ │ [View] [Delete] [Re-process] [Download]                 │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ 📊 Customer_Data.xlsx                                    │  │
│ │ Uploaded: 2024-12-19 | Category: Data                    │  │
│ │ 1,250 rows imported                                      │  │
│ │ [View] [Delete] [Re-process] [Download]                 │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                │
│ [Load More...]                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 5. Supported Formats (30+)

### Documents
- PDF (with OCR for scanned)
- DOCX, DOC
- TXT, MD, RST
- HTML, XML
- XLSX, XLS, CSV

### Images
- PNG, JPG, JPEG, GIF
- SVG (diagrams)
- WebP

### Audio/Video
- MP4, AVI, MOV
- MP3, WAV
- Transcription via Whisper API

### Web
- URLs (web scraping with Playwright)
- RSS feeds

### Code
- JSON, YAML, TOML
- Python, JavaScript, Go (code documentation)

---

## Components Used (shadcn/ui)

- Card, Progress, Badge, Alert
- Input, Textarea, Select, Checkbox
- Button, Tabs
- DropdownMenu (for file actions)
- Icons (Lucide): Upload, File, FileText, FileSpreadsheet, Video, Image, Link, Check, X, AlertCircle

## Special Libraries
- **react-dropzone**: Drag-and-drop file upload
- **react-circular-progressbar**: Circular progress indicators
- **MinIO SDK**: Object storage for files

---

## Accessibility (WCAG 2.1 AA)

- Drag-and-drop also supports click to select (keyboard accessible)
- File list is keyboard navigable
- Progress bars have aria-label with percentage
- Upload status announced to screen readers
- Error messages with role=alert
- Focus trap in modals

---

## i18n Keys

```json
{
  "upload.title": "Upload de Documentos",
  "upload.dragDrop": "Arraste arquivos aqui ou clique para selecionar",
  "upload.formats": "Formatos suportados",
  "upload.maxSize": "Tamanho máximo: 100MB por arquivo",
  "upload.processing": "Processing",
  "upload.complete": "Upload Concluído\!",
  "upload.chunks": "chunks criados",
  "upload.entities": "entidades extraídas",
  "upload.relations": "relações identificadas",
  "upload.library": "Biblioteca de Documentos"
}
```

---

## API Endpoints

```
POST   /api/v1/oracles/:oracleId/documents/upload      - Upload file
POST   /api/v1/oracles/:oracleId/documents/url         - Import from URL
GET    /api/v1/oracles/:oracleId/documents             - List documents
GET    /api/v1/oracles/:oracleId/documents/:id         - Get document details
DELETE /api/v1/oracles/:oracleId/documents/:id         - Delete document
POST   /api/v1/oracles/:oracleId/documents/:id/reprocess - Re-process document
GET    /api/v1/oracles/:oracleId/documents/:id/chunks  - Get chunks
```

---

## Error Handling

### Upload Errors
- File too large: Alert with error message
- Invalid format: Alert with supported formats
- Network error: Retry button
- Processing error: Show detailed error, option to re-process

### Example Error
```
┌────────────────────────────────────────┐
│ ⚠️ Erro ao processar arquivo           │
│                                        │
│ BACEN_Resolution_4753.pdf              │
│                                        │
│ Erro: OCR failed - documento muito    │
│ complexo ou corrompido.                │
│                                        │
│ [Tentar Novamente] [Pular OCR]        │
│ [Cancelar]                             │
└────────────────────────────────────────┘
```

---

**Status**: Ready for Implementation  
**Stack Compliance**: ✅ Next.js 14, shadcn/ui, react-dropzone  
**Accessibility**: ✅ WCAG 2.1 AA  
**Multi-format**: ✅ 30+ file types supported (RF002)  
**Responsive**: ✅ Mobile, Tablet, Desktop
