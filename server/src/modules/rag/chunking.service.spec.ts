import { Test, TestingModule } from '@nestjs/testing';
import { ChunkingService } from './chunking.service';

describe('ChunkingService', () => {
  let service: ChunkingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChunkingService],
    }).compile();

    service = module.get<ChunkingService>(ChunkingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('chunkText', () => {
    it('should chunk simple text', () => {
      const text = 'This is a test. '.repeat(100); // Long text
      const chunks = service.chunkText(text, { chunkSize: 100, chunkOverlap: 10 });

      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach((chunk, idx) => {
        expect(chunk.chunkIndex).toBe(idx);
        expect(chunk.text).toBeTruthy();
        expect(chunk.tokenCount).toBeGreaterThan(0);
      });
    });

    it('should respect paragraph boundaries', () => {
      const text = [
        'First paragraph with some content.',
        'Second paragraph with more content.',
        'Third paragraph with additional content.',
      ].join('\n\n');

      const chunks = service.chunkText(text, {
        chunkSize: 50,
        respectParagraphs: true,
      });

      expect(chunks.length).toBeGreaterThan(0);
      chunks.forEach((chunk) => {
        expect(chunk.text).toBeTruthy();
      });
    });

    it('should handle empty text', () => {
      const chunks = service.chunkText('');
      expect(chunks).toEqual([]);
    });

    it('should handle whitespace-only text', () => {
      const chunks = service.chunkText('   \n\n   \t\t   ');
      expect(chunks).toEqual([]);
    });

    it('should normalize text properly', () => {
      const text = 'Test\r\nwith\n\n\nmultiple\n\n\n\nnewlines   and    spaces';
      const chunks = service.chunkText(text, { chunkSize: 100 });

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].text).not.toContain('\r');
      expect(chunks[0].text).not.toContain('   ');
    });

    it('should create chunks with overlap', () => {
      const text = 'Word '.repeat(200);
      const chunks = service.chunkText(text, {
        chunkSize: 100,
        chunkOverlap: 20,
      });

      expect(chunks.length).toBeGreaterThan(1);
      // Verify chunks have increasing offsets
      for (let i = 1; i < chunks.length; i++) {
        expect(chunks[i].startOffset).toBeGreaterThanOrEqual(chunks[i - 1].startOffset);
      }
    });

    it('should handle large paragraphs by splitting them', () => {
      const largeParagraph = 'Word '.repeat(500);
      const chunks = service.chunkText(largeParagraph, {
        chunkSize: 100,
        respectParagraphs: true,
      });

      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach((chunk) => {
        expect(chunk.tokenCount).toBeLessThanOrEqual(200); // Allow some buffer
      });
    });
  });

  describe('validateChunk', () => {
    it('should validate valid chunks', () => {
      const validChunk = {
        text: 'This is a valid chunk with enough content to pass validation checks.',
        chunkIndex: 0,
        startOffset: 0,
        endOffset: 100,
        tokenCount: 60,
      };

      expect(service.validateChunk(validChunk)).toBe(true);
    });

    it('should reject chunks that are too small', () => {
      const smallChunk = {
        text: 'Too small',
        chunkIndex: 0,
        startOffset: 0,
        endOffset: 9,
        tokenCount: 2,
      };

      expect(service.validateChunk(smallChunk)).toBe(false);
    });

    it('should reject chunks with low token count', () => {
      const lowTokenChunk = {
        text: 'A'.repeat(150), // Long but few tokens
        chunkIndex: 0,
        startOffset: 0,
        endOffset: 150,
        tokenCount: 40,
      };

      expect(service.validateChunk(lowTokenChunk)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle text with special characters', () => {
      const text = 'Text with émojis 🎉 and spëcial çhars!';
      const chunks = service.chunkText(text);

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].text).toContain('🎉');
    });

    it('should handle very short text', () => {
      const text = 'Short.';
      const chunks = service.chunkText(text);

      expect(chunks.length).toBe(1);
      expect(chunks[0].text).toBe('Short.');
    });

    it('should handle text with only newlines', () => {
      const text = '\n\n\n\n';
      const chunks = service.chunkText(text);

      expect(chunks).toEqual([]);
    });
  });
});
