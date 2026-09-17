import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post as HttpPost,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import {
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryService } from './cloudinary/cloudinary.service.js';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

@HttpPost()
@UseGuards(JwtAuthGuard)
@UseInterceptors(
  FileInterceptor('image', {
    storage: memoryStorage(),
  }),
)
async create(
  @Body() createPostDto: CreatePostDto,
  @UploadedFile() file: {
    buffer: Buffer;
  },
  @Req() request: Request,
) {
  if (!file) {
    throw new BadRequestException(
      'La imagen es obligatoria',
    );
  }

  const user = request.user as {
    id: string;
  };

  const result =
    await this.cloudinaryService.uploadImage(file);

  const imageUrl = (result as {
    secure_url: string;
  }).secure_url;

  return this.postsService.create(
    createPostDto,
    user.id,
    imageUrl,
  );
}

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  feed(@Query('limit') limit?: string, @Req() request?: Request) {
    return this.postsService.findFeed(
      (request?.user as { id: string } | undefined)?.id,
      parseInt(limit ?? '', 10) || undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(
      id,
      updatePostDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}