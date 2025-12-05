import { Injectable, Logger } from '@nestjs/common';
import { encode } from 'gpt-tokenizer';

export interface TextChunk {
  text: string;
  chunkIndex: number;
  startOffset: number;
  endOffset: number;
  tokenCount: number;
}

export interface ChunkingOptions {
  chunkSize?: number; // in tokens
  chunkOverlap?: number; // in tokens
  respectParagraphs?: boolean;
}

@Injectable()
export class ChunkingService {
  private readonly logger = new Logger(ChunkingService.name);
  private readonly defaultChunkSize = 512;
  private readonly defaultOverlap = 50;

  /**
   * Splits text into semantic chunks with overlap
   */
  chunkText(text: string, options: ChunkingOptions = {}): TextChunk[] {
    const {
      chunkSize = this.defaultChunkSize,
      chunkOverlap = this.defaultOverlap,
      respectParagraphs = true,
    } = options;

    this.logger.log(
      `Chunking text: ${text.length} chars, chunk size: ${chunkSize}, overlap: ${chunkOverlap}`,
    );

    // Clean and normalize text
    const cleanedText = this.normalizeText(text);

    if (!cleanedText) {
      this.logger.warn('No text to chunk after cleaning');
      return [];
    }

    // Split into paragraphs if requested
    const chunks: TextChunk[] = [];

    if (respectParagraphs) {
      const paragraphs = this.splitIntoParagraphs(cleanedText);
      this.logger.log(`Split text into ${paragraphs.length} paragraphs`);

      let currentChunk = '';
      let currentTokenCount = 0;
      let currentOffset = 0;
      let chunkIndex = 0;

      for (const paragraph of paragraphs) {
        const paragraphTokens = this.countTokens(paragraph);

        // If single paragraph is larger than chunk size, split it
        if (paragraphTokens > chunkSize) {
          // Save current chunk if it has content
          if (currentChunk) {
            chunks.push(this.createChunk(currentChunk, chunkIndex++, currentOffset));
            currentOffset += currentChunk.length;
            currentChunk = '';
            currentTokenCount = 0;
          }

          // Split large paragraph recursively
          const paragraphChunks = this.recursiveCharacterSplit(
            paragraph,
            chunkSize,
            chunkOverlap,
          );

          for (const pChunk of paragraphChunks) {
            chunks.push(
              this.createChunk(pChunk, chunkIndex++, currentOffset),
            );
            currentOffset += pChunk.length;
          }
        } else {
          // Check if adding this paragraph exceeds chunk size
          const combinedTokens = currentTokenCount + paragraphTokens;

          if (combinedTokens > chunkSize && currentChunk) {
            // Save current chunk
            chunks.push(this.createChunk(currentChunk, chunkIndex++, currentOffset));
            currentOffset += currentChunk.length;

            // Start new chunk with overlap
            const overlapText = this.getOverlapText(currentChunk, chunkOverlap);
            currentChunk = overlapText + paragraph;
            currentTokenCount = this.countTokens(currentChunk);
          } else {
            // Add paragraph to current chunk
            currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
            currentTokenCount = combinedTokens;
          }
        }
      }

      // Add final chunk if it has content
      if (currentChunk) {
        chunks.push(this.createChunk(currentChunk, chunkIndex, currentOffset));
      }
    } else {
      // Simple recursive splitting without paragraph awareness
      const splitChunks = this.recursiveCharacterSplit(
        cleanedText,
        chunkSize,
        chunkOverlap,
      );

      splitChunks.forEach((chunkText, index) => {
        chunks.push(this.createChunk(chunkText, index, 0));
      });
    }

    this.logger.log(`Created ${chunks.length} chunks from text`);
    return chunks;
  }

  /**
   * Normalizes text by removing excessive whitespace and special characters
   */
  private normalizeText(text: string): string {
    return text
      .trim()
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
      .replace(/[ \t]+/g, ' ') // Normalize spaces
      .replace(/\s*\n\s*/g, '\n'); // Remove spaces around newlines
  }

  /**
   * Splits text into paragraphs
   */
  private splitIntoParagraphs(text: string): string[] {
    return text
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  /**
   * Counts tokens in text using GPT tokenizer
   */
  private countTokens(text: string): number {
    try {
      return encode(text).length;
    } catch (error) {
      // Fallback to approximate token count (1 token ≈ 4 characters)
      return Math.ceil(text.length / 4);
    }
  }

  /**
   * Recursively splits text by character count
   */
  private recursiveCharacterSplit(
    text: string,
    chunkSize: number,
    overlap: number,
  ): string[] {
    const chunks: string[] = [];

    // Convert token size to approximate character count (4 chars per token)
    const chunkCharSize = chunkSize * 4;
    const overlapCharSize = overlap * 4;

    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkCharSize, text.length);
      let chunk = text.substring(start, end);

      // Try to break at sentence boundary
      if (end < text.length) {
        const sentenceEnd = chunk.lastIndexOf('. ');
        const questionEnd = chunk.lastIndexOf('? ');
        const exclamationEnd = chunk.lastIndexOf('! ');
        const breakPoint = Math.max(sentenceEnd, questionEnd, exclamationEnd);

        if (breakPoint > chunkCharSize * 0.7) {
          chunk = text.substring(start, start + breakPoint + 2);
          start += breakPoint + 2;
        } else {
          start += chunkCharSize - overlapCharSize;
        }
      } else {
        start = text.length;
      }

      if (chunk.trim()) {
        chunks.push(chunk.trim());
      }
    }

    return chunks;
  }

  /**
   * Gets overlap text from the end of a chunk
   */
  private getOverlapText(text: string, overlapTokens: number): string {
    const overlapChars = overlapTokens * 4;
    const start = Math.max(0, text.length - overlapChars);
    let overlap = text.substring(start);

    // Try to start at a word boundary
    const firstSpace = overlap.indexOf(' ');
    if (firstSpace > 0 && firstSpace < overlapChars * 0.3) {
      overlap = overlap.substring(firstSpace + 1);
    }

    return overlap + '\n\n';
  }

  /**
   * Creates a TextChunk object
   */
  private createChunk(
    text: string,
    chunkIndex: number,
    startOffset: number,
  ): TextChunk {
    return {
      text,
      chunkIndex,
      startOffset,
      endOffset: startOffset + text.length,
      tokenCount: this.countTokens(text),
    };
  }

  /**
   * Validates chunk quality
   */
  validateChunk(chunk: TextChunk): boolean {
    // Minimum chunk size: 50 tokens
    if (chunk.tokenCount < 50) {
      this.logger.warn(`Chunk ${chunk.chunkIndex} too small: ${chunk.tokenCount} tokens`);
      return false;
    }

    // Minimum text length: 100 characters
    if (chunk.text.length < 100) {
      this.logger.warn(`Chunk ${chunk.chunkIndex} too short: ${chunk.text.length} chars`);
      return false;
    }

    return true;
  }
}
