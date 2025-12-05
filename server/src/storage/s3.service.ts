import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface PresignedUploadUrl {
  uploadUrl: string;
  fileKey: string;
  expiresIn: number;
}

export interface PresignedDownloadUrl {
  downloadUrl: string;
  expiresIn: number;
}

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly port: string;
  private readonly useSSL: boolean;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get<string>('MINIO_PORT', '9000');
    const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin123');
    const region = this.configService.get<string>('MINIO_REGION', 'us-east-1');

    this.bucket = this.configService.get<string>('MINIO_BUCKET_DOCUMENTS', 'documents');
    this.endpoint = endpoint;
    this.port = port;
    this.useSSL = useSSL;
    this.region = region;

    const protocol = useSSL ? 'https' : 'http';
    const fullEndpoint = `${protocol}://${endpoint}:${port}`;

    this.s3Client = new S3Client({
      endpoint: fullEndpoint,
      region: region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true, // Required for MinIO
    });

    this.logger.log(`S3Service initialized with endpoint: ${fullEndpoint}, bucket: ${this.bucket}`);
  }

  async onModuleInit() {
    // Try to ensure bucket exists, but don't fail server startup if MinIO is unavailable
    await this.ensureBucketExists();
  }

  /**
   * Ensures the documents bucket exists, creates it if not
   * Non-fatal: logs warning but doesn't crash if MinIO is unavailable
   */
  private async ensureBucketExists(): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Bucket '${this.bucket}' exists`);
    } catch (error) {
      if (error.name === 'NotFound') {
        this.logger.log(`Bucket '${this.bucket}' not found, creating...`);
        try {
          await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
          this.logger.log(`Bucket '${this.bucket}' created successfully`);
        } catch (createError) {
          this.logger.error(`Failed to create bucket '${this.bucket}':`, createError);
          // Don't throw - allow server to start without bucket
          this.logger.warn(`Server starting without S3 bucket - document uploads will fail until MinIO is configured`);
        }
      } else {
        this.logger.error(`Failed to check bucket '${this.bucket}':`, error);
        // Don't throw - allow server to start even if MinIO is unavailable
        this.logger.warn(`Server starting without S3 connectivity - document uploads will fail until MinIO is available`);
      }
    }
  }

  /**
   * Generates a presigned URL for uploading a file
   * @param fileKey Unique key for the file in S3
   * @param contentType MIME type of the file
   * @param expiresIn Expiration time in seconds (default 15 minutes)
   * @returns Presigned upload URL and metadata
   */
  async generateUploadPresignedUrl(
    fileKey: string,
    contentType: string,
    expiresIn: number = 900, // 15 minutes
  ): Promise<PresignedUploadUrl> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      this.logger.log(`Generated upload presigned URL for key: ${fileKey}`);

      return {
        uploadUrl,
        fileKey,
        expiresIn,
      };
    } catch (error) {
      this.logger.error(`Failed to generate upload presigned URL for key ${fileKey}:`, error);
      throw error;
    }
  }

  /**
   * Generates a presigned URL for downloading a file
   * @param fileKey Key of the file in S3
   * @param expiresIn Expiration time in seconds (default 1 hour)
   * @returns Presigned download URL
   */
  async generateDownloadPresignedUrl(
    fileKey: string,
    expiresIn: number = 3600, // 1 hour
  ): Promise<PresignedDownloadUrl> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });

      const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      this.logger.log(`Generated download presigned URL for key: ${fileKey}`);

      return {
        downloadUrl,
        expiresIn,
      };
    } catch (error) {
      this.logger.error(`Failed to generate download presigned URL for key ${fileKey}:`, error);
      throw error;
    }
  }

  /**
   * Uploads a file buffer directly to S3
   * @param fileKey Unique key for the file
   * @param buffer File buffer
   * @param contentType MIME type
   * @returns File key
   */
  async uploadFile(fileKey: string, buffer: Buffer, contentType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
        Body: buffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
      this.logger.log(`File uploaded successfully: ${fileKey}`);

      return fileKey;
    } catch (error) {
      this.logger.error(`Failed to upload file ${fileKey}:`, error);
      throw error;
    }
  }

  /**
   * Downloads a file from S3
   * @param fileKey Key of the file
   * @returns File buffer
   */
  async downloadFile(fileKey: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });

      const response = await this.s3Client.send(command);
      const stream = response.Body as any;
      const chunks: Uint8Array[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      this.logger.log(`File downloaded successfully: ${fileKey}`);

      return buffer;
    } catch (error) {
      this.logger.error(`Failed to download file ${fileKey}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a file from S3
   * @param fileKey Key of the file to delete
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${fileKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${fileKey}:`, error);
      throw error;
    }
  }

  /**
   * Validates file size against maximum allowed
   * @param fileSizeBytes File size in bytes
   * @param maxSizeMB Maximum allowed size in MB
   * @returns True if valid
   */
  validateFileSize(fileSizeBytes: number, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return fileSizeBytes <= maxSizeBytes;
  }

  /**
   * Validates file extension against allowed list
   * @param filename Original filename
   * @param allowedExtensions Array of allowed extensions (e.g., ['.pdf', '.docx'])
   * @returns True if valid
   */
  validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return allowedExtensions.some(ext => ext.toLowerCase() === extension);
  }

  /**
   * Gets the file extension from a filename
   * @param filename Original filename
   * @returns File extension including the dot (e.g., '.pdf')
   */
  getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.'));
  }

  /**
   * Generates a unique file key for storage
   * @param originalFilename Original filename
   * @param prefix Optional prefix for organization
   * @returns Unique file key
   */
  generateFileKey(originalFilename: string, prefix?: string): string {
    const extension = this.getFileExtension(originalFilename);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const key = `${timestamp}-${randomString}${extension}`;

    return prefix ? `${prefix}/${key}` : key;
  }
}
