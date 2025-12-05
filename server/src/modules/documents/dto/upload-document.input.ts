import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsUUID, IsInt, Min } from 'class-validator';

@InputType()
export class GetUploadPresignedUrlInput {
  @Field(() => ID)
  @IsUUID()
  documentTypeId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  filename: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  fileSize: number;
}

@InputType()
export class ConfirmDocumentUploadInput {
  @Field(() => ID)
  @IsUUID()
  documentTypeId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  originalFilename: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  fileSize: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  mimeType: string;
}
