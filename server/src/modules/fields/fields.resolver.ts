import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { FieldsService } from './fields.service';
import { FieldEntity } from './entities/field.entity';
import { CreateFieldInput } from './dto/create-field.input';
import { UpdateFieldInput } from './dto/update-field.input';
import { ObjectTypeEntity } from '../object-types/entities/object-type.entity';

@Resolver(() => FieldEntity)
export class FieldsResolver {
  constructor(private readonly fieldsService: FieldsService) {}

  @Query(() => [FieldEntity], { name: 'fields' })
  async findAll(): Promise<FieldEntity[]> {
    return await this.fieldsService.findAll();
  }

  @Query(() => [FieldEntity], { name: 'fieldsByObjectType' })
  async findByObjectType(
    @Args('objectTypeId', { type: () => ID }) objectTypeId: string,
  ): Promise<FieldEntity[]> {
    return await this.fieldsService.findByObjectType(objectTypeId);
  }

  @Query(() => FieldEntity, { name: 'field' })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<FieldEntity> {
    return await this.fieldsService.findOne(id);
  }

  @Mutation(() => FieldEntity)
  async createField(
    @Args('input') input: CreateFieldInput,
  ): Promise<FieldEntity> {
    return await this.fieldsService.create(input);
  }

  @Mutation(() => FieldEntity)
  async updateField(
    @Args('input') input: UpdateFieldInput,
  ): Promise<FieldEntity> {
    return await this.fieldsService.update(input);
  }

  @Mutation(() => Boolean)
  async deleteField(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return await this.fieldsService.delete(id);
  }

  @ResolveField(() => ObjectTypeEntity)
  async objectType(@Parent() field: FieldEntity): Promise<ObjectTypeEntity> {
    return field.objectType;
  }
}
