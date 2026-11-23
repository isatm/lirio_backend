import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Post, PostDocument } from './schema/post.schema.js';
import { User, UserDocument } from '../users/schema/user.schema.js';
import { GarmentTypesService } from '../garment-types/garment-types.service.js';

import { CreatePostDto } from './dto/create-post.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

import { CreateCommentDto } from './dto/create-comment.dto.js';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly garmentTypesService: GarmentTypesService,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    userId: string,
    imageUrl: string,
  ) {
    await this.garmentTypesService.ensureExists(createPostDto.garment_type_id);

    const post = await this.postModel.create({
      ...createPostDto,
      category_ids: [createPostDto.category_ids].flat(),
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

    let preferred: Types.ObjectId[] = [];

    if (userId) {
      const currentObjectId = new Types.ObjectId(userId);

      const user = await this.userModel
        .findById(currentObjectId)
        .select('preferred_categories');

      preferred = (user?.preferred_categories ?? []).map(
        (id) => new Types.ObjectId(id),
      );
    }

    let matched: any[] = [];

    if (preferred.length > 0) {
      matched = await this.postModel.aggregate([
        { $match: { category_ids: { $in: preferred } } },
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
    if (updatePostDto.garment_type_id) {
      await this.garmentTypesService.ensureExists(updatePostDto.garment_type_id);
    }

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

  async toggleLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    const likedBy = post.liked_by ?? [];
    const index = likedBy.indexOf(userId);

    if (index >= 0) {
      likedBy.splice(index, 1);
    } else {
      likedBy.push(userId);
    }

    post.liked_by = likedBy;
    await post.save();

    return {
      message: index >= 0 ? 'Like eliminado' : 'Like añadido',
      liked: index < 0,
      likesCount: likedBy.length,
      post,
    };
  }

  async getLikedPosts(userId: string) {
    return this.postModel
      .find({ liked_by: userId })
      .sort({ createdAt: -1 });
  }

  async toggleSave(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    const savedBy = post.saved_by ?? [];
    const index = savedBy.indexOf(userId);

    if (index >= 0) {
      savedBy.splice(index, 1);
    } else {
      savedBy.push(userId);
    }

    post.saved_by = savedBy;
    await post.save();

    return {
      message: index >= 0 ? 'Guardado eliminado' : 'Guardado añadido',
      saved: index < 0,
      savedCount: savedBy.length,
      post,
    };
  }

  async getSavedPosts(userId: string) {
    return this.postModel
      .find({ saved_by: userId })
      .sort({ createdAt: -1 });
  }

  private getCommentText(payload: CreateCommentDto) {
    const text = payload?.content ?? payload?.text ?? payload?.comment;

    if (typeof text !== 'string') {
      throw new BadRequestException('El comentario es obligatorio');
    }

    const cleanedText = text.trim();

    if (!cleanedText) {
      throw new BadRequestException('El comentario no puede estar vacío');
    }

    return cleanedText;
  }

  async addComment(postId: string, userId: string, payload: CreateCommentDto) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    const content = this.getCommentText(payload);
    const comment = {
      user_id: userId,
      content,
    };

    post.comments = post.comments ?? [];
    post.comments.push(comment as any);
    await post.save();

    return {
      message: 'Comentario añadido correctamente',
      comment: post.comments[post.comments.length - 1],
      commentsCount: post.comments.length,
      post,
    };
  }

  async getComments(postId: string) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    return post.comments ?? [];
  }

  async removeComment(postId: string, commentId: string, userId: string) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    const commentIndex = (post.comments ?? []).findIndex(
      (comment: any) => comment._id?.toString() === commentId,
    );

    if (commentIndex === -1) {
      throw new NotFoundException('Comentario no encontrado');
    }

    const comment = (post.comments ?? [])[commentIndex];

    if (comment.user_id !== userId) {
      throw new ForbiddenException('No puedes eliminar este comentario');
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    return {
      message: 'Comentario eliminado correctamente',
      commentsCount: post.comments.length,
      post,
    };
  }


// Agregar comentario
async addComment(
  postId: string,
  userId: string,
  createCommentDto: CreateCommentDto,
) {
  const post = await this.postModel.findById(postId);

  if (!post) {
    throw new NotFoundException('Post no encontrado');
  }

  const content: string = createCommentDto.content.trim();

  post.comments.push({
    _id: new Types.ObjectId(),
    user_id: userId,
    content: content,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await post.save();

  const user = await this.userModel
  .findById(userId)
  .select('user_name avatar_url');

  const savedComment = post.comments[post.comments.length - 1];

  return {
    message: 'Comentario añadido correctamente',
    comment: {
      _id: savedComment._id,
      user_id: savedComment.user_id,
      content: savedComment.content,
      createdAt: savedComment.createdAt,
      updatedAt: savedComment.updatedAt,
      user_name: user?.user_name ?? 'Usuario',
    },
    commentsCount: post.comments.length,
  };
}

  // Consultar comentarios
async getComments(postId: string) {
  const post = await this.postModel.findById(postId);

  if (!post) {
    throw new NotFoundException('Post no encontrado');
  }


  const userIds = post.comments.map((comment) => comment.user_id);

  const users = await this.userModel
    .find({ _id: { $in: userIds } })
    .select('user_name avatar_url');

  const usersMap = new Map(
    users.map((user) => [user._id.toString(), user]),
  );

  return post.comments.map((comment) => {
    const user = usersMap.get(comment.user_id);

    return {
      _id: comment._id,
      user_id: comment.user_id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user_name: user?.user_name,
      avatar_url: user?.avatar_url ?? '',
    };
  });
}

  // Editar comentario
  async updateComment(
    postId: string,
    commentId: string,
    userId: string,
    content: string,
  ) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    const comment = post.comments.find(
      (comment) => comment._id.toString() === commentId,
    );

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException(
        'No puedes editar este comentario',
      );
    }

    comment.content = content;
    await post.save();

    return {
      message: 'Comentario actualizado correctamente',
      comment,
    };
  }

    // Eliminar comentario
  async deleteComment(postId: string, commentId: string, userId: string) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const comment = post.comments.find(
      (comment) => comment._id.toString() === commentId,
    );

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('No puedes eliminar este comentario');
    }

    post.comments = post.comments.filter(
      (comment) => comment._id.toString() !== commentId,
    );

    await post.save();

    return { message: 'Comentario eliminado correctamente' };
  }
}