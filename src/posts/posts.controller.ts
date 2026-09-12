import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post as HttpPost,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
  ) {}

  @HttpPost()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createPostDto: CreatePostDto,
    @Req() request: Request,
  ) {
    const user = request.user as {
      id: string;
    };

    return this.postsService.create(
      createPostDto,
      user.id,
    );
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
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