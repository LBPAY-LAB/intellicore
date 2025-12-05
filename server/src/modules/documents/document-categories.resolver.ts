import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { DocumentCategoriesService } from './document-categories.service';
import { DocumentCategory, GoldLayer } from './entities/document-category.entity';
import { CreateDocumentCategoryInput } from './dto/create-document-category.input';
import { UpdateDocumentCategoryInput } from './dto/update-document-category.input';
import { Auth } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';

@Resolver(() => DocumentCategory)
export class DocumentCategoriesResolver {
  constructor(private readonly documentCategoriesService: DocumentCategoriesService) {}

  @Auth('admin', 'backoffice')
  @Mutation(() => DocumentCategory)
  async createDocumentCategory(
    @Args('input') input: CreateDocumentCategoryInput,
  ): Promise<DocumentCategory> {
    return this.documentCategoriesService.create(input);
  }

  @Auth('admin', 'backoffice')
  @Mutation(() => DocumentCategory)
  async updateDocumentCategory(
    @Args('input') input: UpdateDocumentCategoryInput,
  ): Promise<DocumentCategory> {
    return this.documentCategoriesService.update(input);
  }

  @Auth('admin', 'backoffice')
  @Mutation(() => Boolean)
  async deleteDocumentCategory(@Args('id') id: string): Promise<boolean> {
    await this.documentCategoriesService.remove(id);
    return true;
  }

  @Public()
  @Query(() => [DocumentCategory], { name: 'documentCategories' })
  async findAll(): Promise<DocumentCategory[]> {
    return this.documentCategoriesService.findAll();
  }

  @Public()
  @Query(() => [DocumentCategory], { name: 'activeDocumentCategories' })
  async findAllActive(): Promise<DocumentCategory[]> {
    return this.documentCategoriesService.findAllActive();
  }

  @Public()
  @Query(() => [DocumentCategory], { name: 'documentCategoriesByGoldLayer' })
  async findByGoldLayer(
    @Args('goldLayer', { type: () => GoldLayer }) goldLayer: GoldLayer,
  ): Promise<DocumentCategory[]> {
    return this.documentCategoriesService.findByGoldLayer(goldLayer);
  }

  @Public()
  @Query(() => DocumentCategory, { name: 'documentCategory' })
  async findOne(@Args('id') id: string): Promise<DocumentCategory> {
    return this.documentCategoriesService.findOne(id);
  }
}
