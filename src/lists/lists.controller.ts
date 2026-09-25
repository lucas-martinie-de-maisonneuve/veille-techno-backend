import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import type { AuthRequest } from '@/common/types/auth-request.type';
import { List } from './entities/list.entity';

@ApiTags('Lists')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new list' })
  @ApiCreatedResponse({ description: 'List created', type: List })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  async create(@Body() dto: CreateListDto, @Request() req: AuthRequest) {
    return this.listsService.create(dto, req.user as any);
  }

  @Get()
  @ApiOperation({ summary: 'Get all my lists' })
  @ApiOkResponse({ description: 'List of lists', type: List })
  async findAll(@Request() req: AuthRequest) {
    return this.listsService.findAll(req.user as any);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a list' })
  @ApiOkResponse({ description: 'List updated', type: List })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'List not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateListDto,
    @Request() req: AuthRequest,
  ) {
    return this.listsService.update(id, dto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a list' })
  @ApiNoContentResponse({ description: 'List deleted' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'List not found' })
  async remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.listsService.remove(id, req.user);
  }
}
