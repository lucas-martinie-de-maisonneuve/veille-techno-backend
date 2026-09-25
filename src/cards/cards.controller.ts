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
  ApiOkResponse,
  ApiOperation,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import type { AuthRequest } from '@/common/types/auth-request.type';

@ApiTags('Cards')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller()
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post('lists/:listId/cards')
  @ApiOperation({ summary: 'Create a card in a list' })
  @ApiCreatedResponse({ description: 'Card created', type: Card })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'List not found' })
  async create(
    @Param('listId') listId: string,
    @Body() dto: CreateCardDto,
    @Request() req: AuthRequest,
  ) {
    return this.cardsService.create(listId, dto, req.user);
  }

  @Get('lists/:listId/cards')
  @ApiOperation({ summary: 'Get all cards of a list' })
  @ApiOkResponse({ description: 'List of cards', type: Card })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'List not found' })
  async findAllByList(
    @Param('listId') listId: string,
    @Request() req: AuthRequest,
  ) {
    return this.cardsService.findAllByList(listId, req.user);
  }

  @Get('cards/:id')
  @ApiOperation({ summary: 'Get a card by id' })
  @ApiOkResponse({ description: 'Card found', type: Card })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  async findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.cardsService.findOne(id, req.user);
  }

  @Patch('cards/:id')
  @ApiOperation({ summary: 'Update a card' })
  @ApiOkResponse({ description: 'Card updated', type: Card })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
    @Request() req: AuthRequest,
  ) {
    return this.cardsService.update(id, dto, req.user);
  }

  @Delete('cards/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a card' })
  @ApiNoContentResponse({ description: 'Card deleted' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Card not found' })
  async remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.cardsService.remove(id, req.user);
  }
}
