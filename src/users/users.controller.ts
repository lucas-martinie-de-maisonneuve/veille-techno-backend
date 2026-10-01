import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole, User } from './entities/user.entity';
import type { AuthRequest } from '@/common/types/auth-request.type';
import { ErrorMessages } from '@/common/constants/error-messages';

@ApiTags('Users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Update user information and role.
   * Only admins can update other users' roles.
   * Users can update their own information but not their role.
   * @param id The ID of the user to update.
   * @param dto The data transfer object containing the updated user information.
   * @param req The request object containing the authenticated user's information.
   * @returns The updated user information.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update user info and role' })
  @ApiOkResponse({ description: 'User updated' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Request() req: AuthRequest & { user: { id: string; role: UserRole } },
  ) {
    return this.usersService.update(id, dto, req.user);
  }

  /**
   * Get the profile of the currently authenticated user.
   * @param req The request object containing the authenticated user's information.
   * @returns The profile information of the currently authenticated user.
   */
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'Current user profile', type: User })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async me(@Request() req: AuthRequest) {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id (admin only)' })
  @ApiOkResponse({ description: 'User found', type: User })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    if (req.user.role !== UserRole.ADMIN && req.user.id !== id) {
      throw new ForbiddenException(ErrorMessages.users.FORBIDDEN_PROFILE);
    }
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException(ErrorMessages.users.NOT_FOUND);
    return user;
  }
}
