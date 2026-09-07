import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { UsersService } from './users.service.js';
import { RegisterUserDto } from './dto/register_dto.js';
import { LoginUserDto } from './dto/login_dto.js';

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
}