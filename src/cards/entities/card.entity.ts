import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { List } from '@/lists/entities/list.entity';

@Entity('cards')
export class Card {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Fix login bug' })
  @Column()
  title: string;

  @ApiProperty({
    example: 'The login button does not work on mobile',
    nullable: true,
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ example: 0 })
  @Column({ default: 0 })
  position: number;

  @ApiProperty()
  @ManyToOne(() => List, { eager: true, onDelete: 'CASCADE' })
  list: List;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
