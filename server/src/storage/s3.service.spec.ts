import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';

describe('S3Service', () => {
  let service: S3Service;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        MINIO_ENDPOINT: 'localhost',
        MINIO_PORT: '9000',
        MINIO_USE_SSL: 'false',
        MINIO_ACCESS_KEY: 'minioadmin',
        MINIO_SECRET_KEY: 'minioadmin123',
        MINIO_BUCKET_DOCUMENTS: 'test-documents',
        MINIO_REGION: 'us-east-1',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateFileSize', () => {
    it('should validate file size correctly', () => {
      // 5MB file, 10MB max
      expect(service.validateFileSize(5 * 1024 * 1024, 10)).toBe(true);

      // 15MB file, 10MB max
      expect(service.validateFileSize(15 * 1024 * 1024, 10)).toBe(false);

      // Exactly 10MB file, 10MB max
      expect(service.validateFileSize(10 * 1024 * 1024, 10)).toBe(true);
    });
  });

  describe('validateFileExtension', () => {
    it('should validate file extension correctly', () => {
      const allowedExtensions = ['.pdf', '.docx', '.txt'];

      expect(service.validateFileExtension('document.pdf', allowedExtensions)).toBe(true);
      expect(service.validateFileExtension('document.DOCX', allowedExtensions)).toBe(true);
      expect(service.validateFileExtension('readme.txt', allowedExtensions)).toBe(true);
      expect(service.validateFileExtension('image.jpg', allowedExtensions)).toBe(false);
      expect(service.validateFileExtension('script.js', allowedExtensions)).toBe(false);
    });

    it('should be case insensitive', () => {
      const allowedExtensions = ['.PDF', '.DOCX'];
      expect(service.validateFileExtension('document.pdf', allowedExtensions)).toBe(true);
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension correctly', () => {
      expect(service.getFileExtension('document.pdf')).toBe('.pdf');
      expect(service.getFileExtension('archive.tar.gz')).toBe('.gz');
      expect(service.getFileExtension('README')).toBe('');
      expect(service.getFileExtension('file.name.with.dots.txt')).toBe('.txt');
    });
  });

  describe('generateFileKey', () => {
    it('should generate unique file key with extension', () => {
      const key1 = service.generateFileKey('document.pdf');
      const key2 = service.generateFileKey('document.pdf');

      expect(key1).toMatch(/^\d+-[a-z0-9]+\.pdf$/);
      expect(key2).toMatch(/^\d+-[a-z0-9]+\.pdf$/);
      expect(key1).not.toBe(key2); // Should be unique
    });

    it('should generate file key with prefix', () => {
      const key = service.generateFileKey('document.pdf', 'policies');
      expect(key).toMatch(/^policies\/\d+-[a-z0-9]+\.pdf$/);
    });

    it('should preserve file extension', () => {
      const pdfKey = service.generateFileKey('document.pdf');
      const docxKey = service.generateFileKey('document.docx');
      const txtKey = service.generateFileKey('readme.txt');

      expect(pdfKey).toMatch(/\.pdf$/);
      expect(docxKey).toMatch(/\.docx$/);
      expect(txtKey).toMatch(/\.txt$/);
    });
  });
});
