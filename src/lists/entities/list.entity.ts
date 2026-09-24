import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('lists')
export class List {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'Todo' })
    @Column()
    title: string;

    @ApiProperty({ example: 0 })
    @Column({ default: 0 })
    position: number;

    @ApiProperty()
    @ManyToOne(() => User, { eager: true })
    owner: User;

    @ApiProperty()
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt: Date;
}