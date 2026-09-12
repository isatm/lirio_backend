import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Post, PostDocument } from './schema/post.schema.js';

import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string) {
    const post = await this.postModel.create({
      ...createPostDto,
      user_id: userId,
    });

    return {
      message: 'Post creado correctamente',
      post,
    };
  }

  async findAll() {
    return this.postModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.postModel.findByIdAndUpdate(
      id,
      updatePostDto,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    return {
      message: 'Post actualizado correctamente',
      post,
    };
  }

  async remove(id: string) {
    const post = await this.postModel.findByIdAndDelete(id);

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    return {
      message: 'Post eliminado correctamente',
    };
  }
}