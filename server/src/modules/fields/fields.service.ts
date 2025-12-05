import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldEntity } from './entities/field.entity';
import { CreateFieldInput } from './dto/create-field.input';
import { UpdateFieldInput } from './dto/update-field.input';

@Injectable()
export class FieldsService {
  constructor(
    @InjectRepository(FieldEntity)
    private readonly fieldRepository: Repository<FieldEntity>,
  ) {}

  async create(input: CreateFieldInput): Promise<FieldEntity> {
    const field = this.fieldRepository.create(input);
    return await this.fieldRepository.save(field);
  }

  async findAll(): Promise<FieldEntity[]> {
    return await this.fieldRepository.find({
      relations: ['objectType'],
    });
  }

  async findByObjectType(objectTypeId: string): Promise<FieldEntity[]> {
    return await this.fieldRepository.find({
      where: { object_type_id: objectTypeId },
      relations: ['objectType'],
    });
  }

  async findOne(id: string): Promise<FieldEntity> {
    const field = await this.fieldRepository.findOne({
      where: { id },
      relations: ['objectType'],
    });

    if (!field) {
      throw new NotFoundException(`Field with ID "${id}" not found`);
    }

    return field;
  }

  async update(input: UpdateFieldInput): Promise<FieldEntity> {
    const field = await this.findOne(input.id);
    Object.assign(field, input);
    return await this.fieldRepository.save(field);
  }

  async delete(id: string): Promise<boolean> {
    const field = await this.findOne(id);
    await this.fieldRepository.remove(field);
    return true;
  }
}
