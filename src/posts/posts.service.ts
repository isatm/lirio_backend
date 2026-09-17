import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Post, PostDocument } from './schema/post.schema.js';
import { User, UserDocument } from '../users/schema/user.schema.js';
import { Category, CategoryDocument } from '../categories/schema/category.schema.js';

import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    userId: string,
    imageUrl: string,
  ) {
    const post = await this.postModel.create({
      ...createPostDto,
      image: imageUrl,
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

  /**
   * Feed personalizado: primero los posts que coinciden con las categorías
   * preferidas del usuario (máximo 4) y se completa con posts aleatorios.
   */
  async findFeed(userId?: string, limit?: number) {
    const size = Math.min(Math.max(limit ?? 20, 1), 50);
    const prefCount = Math.min(size, 4);

    let term: string | null = null;

    if (userId) {
      const currentObjectId = new Types.ObjectId(userId);

      const user = await this.userModel
        .findById(currentObjectId)
        .select('preferred_categories');

      const preferred = user?.preferred_categories ?? [];

      if (preferred.length > 0) {
        const categories = await this.categoryModel.find({
          _id: { $in: preferred },
        });

        const names = categories
          .map((category) => category.name)
          .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

        term = names.join('|');
      }
    }

    let matched: any[] = [];

    if (term) {
      const regex = new RegExp(term, 'i');

      matched = await this.postModel.aggregate([
        {
          $match: {
            $or: [{ title: regex }, { description: regex }],
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: prefCount },
      ]);
    }

    const matchedIds = matched.map((post) => post._id);

    const random: any[] = await this.postModel.aggregate([
      { $match: { _id: { $nin: matchedIds } } },
      { $sample: { size: Math.max(size - matchedIds.length, 0) } },
      { $sort: { createdAt: -1 } },
    ]);

    return [...matched, ...random].slice(0, size);
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

  async removeAllByUser(userId: string) {
    return this.postModel.deleteMany({ user_id: userId });
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