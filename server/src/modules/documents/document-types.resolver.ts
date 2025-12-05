import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { DocumentTypesService } from './document-types.service';
import { DocumentType } from './entities/document-type.entity';
import { CreateDocumentTypeInput } from './dto/create-document-type.input';
import { UpdateDocumentTypeInput } from './dto/update-document-type.input';
import { Auth } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';

@Resolver(() => DocumentType)
export class DocumentTypesResolver {
  constructor(private readonly documentTypesService: DocumentTypesService) {}

  @Auth('admin', 'backoffice')
  @Mutation(() => DocumentType)
  async createDocumentType(
    @Args('input') input: CreateDocumentTypeInput,
  ): Promise<DocumentType> {
    return this.documentTypesService.create(input);
  }

  @Auth('admin', 'backoffice')
  @Mutation(() => DocumentType)
  async updateDocumentType(
    @Args('input') input: UpdateDocumentTypeInput,
  ): Promise<DocumentType> {
    return this.documentTypesService.update(input);
  }

  @Auth('admin', 'backoffice')
  @Mutation(() => Boolean)
  async deleteDocumentType(@Args('id') id: string): Promise<boolean> {
    await this.documentTypesService.remove(id);
    return true;
  }

  @Public()
  @Query(() => [DocumentType], { name: 'documentTypes' })
  async findAll(): Promise<DocumentType[]> {
    return this.documentTypesService.findAll();
  }

  @Public()
  @Query(() => [DocumentType], { name: 'activeDocumentTypes' })
  async findAllActive(): Promise<DocumentType[]> {
    return this.documentTypesService.findAllActive();
  }

  @Public()
  @Query(() => DocumentType, { name: 'documentType' })
  async findOne(@Args('id') id: string): Promise<DocumentType> {
    return this.documentTypesService.findOne(id);
  }
}
