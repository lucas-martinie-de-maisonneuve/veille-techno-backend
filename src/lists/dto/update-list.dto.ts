import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateListDto {
  @ApiProperty({ example: 'In Progress', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  position?: number;
}
