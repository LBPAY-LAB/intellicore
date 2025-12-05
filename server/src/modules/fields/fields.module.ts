import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldsService } from './fields.service';
import { FieldsResolver } from './fields.resolver';
import { FieldEntity } from './entities/field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FieldEntity])],
  providers: [FieldsService, FieldsResolver],
  exports: [FieldsService],
})
export class FieldsModule {}
