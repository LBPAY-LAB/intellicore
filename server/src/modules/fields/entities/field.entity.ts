import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectTypeEntity } from '../../object-types/entities/object-type.entity';

export enum FieldType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  ENUM = 'ENUM',
  RELATION = 'RELATION',
}

registerEnumType(FieldType, {
  name: 'FieldType',
  description: 'Types of fields supported by the system',
});

@ObjectType()
@Entity('fields')
export class FieldEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  object_type_id: string;

  @Field(() => ObjectTypeEntity)
  @ManyToOne(() => ObjectTypeEntity, (objectType) => objectType.fields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'object_type_id' })
  objectType: ObjectTypeEntity;

  @Field()
  @Column()
  name: string;

  @Field(() => FieldType)
  @Column({
    type: 'enum',
    enum: FieldType,
  })
  field_type: FieldType;

  @Field()
  @Column({ default: false })
  is_required: boolean;

  @Field(() => String, { nullable: true })
  @Column('jsonb', { nullable: true })
  validation_rules?: any;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field()
  @UpdateDateColumn()
  updated_at: Date;
}
