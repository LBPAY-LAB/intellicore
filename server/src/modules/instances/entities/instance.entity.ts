import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ObjectTypeEntity } from '../../object-types/entities/object-type.entity';
import { InstanceRelationshipEntity } from './instance-relationship.entity';
import GraphQLJSON from 'graphql-type-json';

export enum InstanceStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

registerEnumType(InstanceStatus, {
  name: 'InstanceStatus',
  description: 'Status of an instance',
});

@ObjectType()
@Entity('instances')
export class InstanceEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'object_type_id' })
  objectTypeId: string;

  @Field(() => ObjectTypeEntity)
  @ManyToOne(() => ObjectTypeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'object_type_id' })
  objectType: ObjectTypeEntity;

  @Field(() => GraphQLJSON)
  @Column('jsonb', { default: {} })
  data: Record<string, any>;

  @Field(() => InstanceStatus)
  @Column({
    type: 'enum',
    enum: InstanceStatus,
    default: InstanceStatus.DRAFT,
  })
  status: InstanceStatus;

  @Field({ nullable: true })
  @Column({ name: 'display_name', nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: string;

  @Field()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Field(() => [InstanceRelationshipEntity], { nullable: true })
  @OneToMany(() => InstanceRelationshipEntity, (rel) => rel.sourceInstance)
  outgoingRelationships?: InstanceRelationshipEntity[];

  @Field(() => [InstanceRelationshipEntity], { nullable: true })
  @OneToMany(() => InstanceRelationshipEntity, (rel) => rel.targetInstance)
  incomingRelationships?: InstanceRelationshipEntity[];

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field({ nullable: true })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
