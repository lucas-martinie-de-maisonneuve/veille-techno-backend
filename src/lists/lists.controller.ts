import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiCreatedResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UserRole } from '@/users/entities/user.entity';

@ApiTags('Lists')
@ApiBearerAuth()
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new list' })
  @ApiCreatedResponse({ description: 'List created' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(
    @Body() dto: CreateListDto,
    @Request() req: ExpressRequest & { user: { id: string; role: UserRole } },
  ) {
    return this.listsService.create(dto, req.user as any);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lists' })
  @ApiOkResponse({ description: 'List of lists' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll(
    @Request() req: ExpressRequest & { user: { id: string; role: UserRole } },
  ) {
    return this.listsService.findAll(req.user as any);
  }
}