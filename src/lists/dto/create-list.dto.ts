import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateListDto {
  @ApiProperty({ example: 'To Do' })
  @IsString()
  title: string;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  position?: number;
}