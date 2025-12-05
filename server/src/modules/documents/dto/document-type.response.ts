import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class DocumentTypeResponse {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String])
  allowedExtensions: string[];

  @Field(() => Int)
  maxFileSizeMb: number;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
