import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { DocumentTypeResponse } from './document-type.response';

@ObjectType()
export class DocumentResponse {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  documentTypeId: string;

  @Field(() => DocumentTypeResponse)
  documentType: DocumentTypeResponse;

  @Field()
  originalFilename: string;

  @Field()
  storedFilename: string;

  @Field()
  fileKey: string;

  @Field(() => Int)
  fileSize: number;

  @Field()
  mimeType: string;

  @Field()
  s3Bucket: string;

  @Field({ nullable: true })
  extractedText?: string;

  @Field()
  isProcessed: boolean;

  @Field()
  uploadedBy: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class UploadPresignedUrlResponse {
  @Field()
  uploadUrl: string;

  @Field()
  fileKey: string;

  @Field(() => Int)
  expiresIn: number;
}
