import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { UsersService } from './users.service.js';
import { RegisterUserDto } from './dto/register_dto.js';
import { LoginUserDto } from './dto/login_dto.js';
import { UpdateProfileDto } from './dto/update_profile.dto.js';
import { UpdatePasswordDto } from './dto/update_password.dto.js';
import { CreateUserDto } from './dto/create_user.dto.js';
import { UpdateUserDto } from './dto/update_user.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }
@Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }

@Get('me')
    @UseGuards(JwtAuthGuard)
  me(@Req() request: Request) {
    return this.usersService.findOne(
      (request.user as { id: string }).id,
    );
  }

    @Patch('me')
    @UseGuards(JwtAuthGuard)
  updateMe(
    @Req() request: Request,
    @Body() data: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(
      (request.user as { id: string }).id,
      data,
    );
  }

    @Patch('me/password')
    @UseGuards(JwtAuthGuard)
  updatePassword(
    @Req() request: Request,
    @Body() data: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(
      (request.user as { id: string }).id,
      data.new_password,
    );
  }

    @Delete('me')
    @UseGuards(JwtAuthGuard)
  removeMe(@Req() request: Request) {
    return this.usersService.removeAccount(
      (request.user as { id: string }).id,
    );
  }

    @Get('suggestions')
    @UseGuards(JwtAuthGuard)
  suggestions(
    @Query('limit') limit?: string,
    @Req() request?: Request,
  ) {
    return this.usersService.suggestions(
      parseInt(limit ?? '3', 10) || 3,
      (request?.user as { id: string } | undefined)?.id,
    );
  }

    @Get('search')
    @UseGuards(JwtAuthGuard)
  search(@Query('q') q?: string, @Query('limit') limit?: string) {
    return this.usersService.search(
      q ?? '',
      parseInt(limit ?? '', 10) || undefined,
    );
  }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createByAdmin(createUserDto);
  }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}