import { Body, Controller, Patch, Param, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user.entity';
import { Request as ExpressRequest } from 'express';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user info and role' })
    @ApiResponse({ status: 200, description: 'User updated' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
        @Request() req: ExpressRequest & { user: { id: string; role: UserRole } },
    ) {
        return this.usersService.update(id, dto, req.user);
    }
}