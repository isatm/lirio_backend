import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

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
import { CloudinaryService } from '../posts/cloudinary/cloudinary.service.js';

const PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const PROFILE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const profileImageOptions: NonNullable<
  Parameters<typeof FileInterceptor>[1]
> = {
  storage: memoryStorage(),
  limits: { fileSize: PROFILE_IMAGE_BYTES },
  fileFilter: (_request, file, callback) => {
    if (!PROFILE_IMAGE_TYPES.includes(file.mimetype)) {
      callback(
        new BadRequestException('La imagen debe ser JPG, PNG o WebP'),
        false,
      );
      return;
    }

    callback(null, true);
  },
};

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
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

    @Patch('me/avatar')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image', profileImageOptions))
  async updateAvatar(
    @Req() request: Request,
    @UploadedFile() file: { buffer: Buffer } | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('La foto de perfil es obligatoria');
    }

    const image = await this.cloudinaryService.uploadImage(file, {
      folder: 'liriohibisco/avatars',
      transformation: [
        { width: 600, height: 600, crop: 'fill', gravity: 'face' },
      ],
    });

    return this.usersService.setProfileImage(
      (request.user as { id: string }).id,
      'avatar',
      image,
    );
  }

    @Delete('me/avatar')
    @UseGuards(JwtAuthGuard)
  removeAvatar(@Req() request: Request) {
    return this.usersService.setProfileImage(
      (request.user as { id: string }).id,
      'avatar',
      null,
    );
  }

    @Patch('me/banner')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image', profileImageOptions))
  async updateBanner(
    @Req() request: Request,
    @UploadedFile() file: { buffer: Buffer } | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('La foto de portada es obligatoria');
    }

    const image = await this.cloudinaryService.uploadImage(file, {
      folder: 'liriohibisco/banners',
      transformation: [
        { width: 1600, height: 600, crop: 'fill', gravity: 'auto' },
      ],
    });

    return this.usersService.setProfileImage(
      (request.user as { id: string }).id,
      'banner',
      image,
    );
  }

    @Delete('me/banner')
    @UseGuards(JwtAuthGuard)
  removeBanner(@Req() request: Request) {
    return this.usersService.setProfileImage(
      (request.user as { id: string }).id,
      'banner',
      null,
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

  // En users.controller.ts — agregar ANTES del @Get(':id') restringido a ADMIN
  // (el orden importa en NestJS: rutas más específicas van primero)
  @Get(':id/profile')
  @UseGuards(JwtAuthGuard)
  profile(@Param('id') id: string) {
    return this.usersService.findPublicProfile(id);
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