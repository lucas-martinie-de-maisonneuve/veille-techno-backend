import { Body, Controller, Patch, Param, Request } from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiOkResponse,
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user.entity';
import { Request as ExpressRequest } from 'express';

@ApiTags('Users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

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
    @ApiNotFoundResponse({ description: 'User not found' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
        @Request() req: ExpressRequest & { user: { id: string; role: UserRole } },
    ) {
        return this.usersService.update(id, dto, req.user);
    }
}