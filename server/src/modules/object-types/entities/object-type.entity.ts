import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { FieldEntity } from '../../fields/entities/field.entity';

@ObjectType()
@Entity('object_types')
export class ObjectTypeEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field({ nullable: true })
  @Column('text', { nullable: true })
  description: string;

  @Field()
  @Column({ default: true })
  is_active: boolean;

  @Field(() => [FieldEntity], { nullable: true })
  @OneToMany(() => FieldEntity, (field) => field.objectType, { cascade: true })
  fields?: FieldEntity[];

  // Note: relationships field is resolved via field resolver in RelationshipsModule
  // We don't define OneToMany here to avoid circular dependency issues
  // The field resolver will query relationships dynamically

  @Field({ nullable: true })
  @Column({ nullable: true, length: 100 })
  created_by?: string;

  @Field({ nullable: true })
  @Column({ nullable: true, length: 100 })
  updated_by?: string;

  @Field()
  @CreateDateColumn()
  created_at: Date;

  @Field()
  @UpdateDateColumn()
  updated_at: Date;

  @Field({ nullable: true })
  @DeleteDateColumn()
  deleted_at?: Date;
}
