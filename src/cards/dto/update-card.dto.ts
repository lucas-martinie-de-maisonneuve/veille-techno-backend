import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCardDto {
  @ApiProperty({ example: 'Fix login bug', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'The login button does not work on mobile',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  position?: number;

  @ApiProperty({ example: 'uuid-of-target-list', required: false })
  @IsUUID()
  @IsOptional()
  listId?: string;
}
