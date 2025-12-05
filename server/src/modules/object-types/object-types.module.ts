import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectTypesService } from './object-types.service';
import { ObjectTypesResolver } from './object-types.resolver';
import { ObjectTypeEntity } from './entities/object-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ObjectTypeEntity])],
  providers: [ObjectTypesService, ObjectTypesResolver],
  exports: [ObjectTypesService],
})
export class ObjectTypesModule {}
