import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Post, PostDocument } from '../posts/schema/post.schema.js';
import type { GarmentType } from '../posts/schema/post.schema.js';
import { Outfit, OutfitDocument } from './schema/outfit.schema.js';

import { CreateOutfitDto, OutfitItemDto } from './dto/create-outfit.dto.js';
import { UpdateOutfitDto } from './dto/update-outfit.dto.js';

const OUTFIT_NOT_FOUND = 'Outfit no encontrado';

@Injectable()
export class OutfitsService {
  constructor(
    @InjectModel(Outfit.name)
    private readonly outfitModel: Model<OutfitDocument>,
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  async create(createOutfitDto: CreateOutfitDto, userId: string) {
    const items = await this.buildItems(createOutfitDto.items, userId);

    const outfit = await this.outfitModel.create({
      name: createOutfitDto.name.trim(),
      is_public: createOutfitDto.is_public ?? false,
      user_id: userId,
      items,
    });

    const [view] = await this.toViews([outfit]);

    return {
      message: 'Outfit creado correctamente',
      outfit: view,
    };
  }

  async findMine(userId: string) {
    const outfits = await this.outfitModel
      .find({ user_id: userId })
      .sort({ createdAt: -1 });

    return this.toViews(outfits);
  }

  async findPublic() {
    const outfits = await this.outfitModel
      .find({ is_public: true })
      .sort({ createdAt: -1 });

    const views = await this.toViews(outfits);

    return views.filter((outfit) => outfit.is_available);
  }

  async findOne(id: string, userId: string) {
    const outfit = await this.findByIdOrFail(id);
    const [view] = await this.toViews([outfit]);

    const isOwner = outfit.user_id === userId;
    const isVisible = outfit.is_public && view.is_available;

    if (!isOwner && !isVisible) {
      throw new NotFoundException(OUTFIT_NOT_FOUND);
    }

    return view;
  }

  async update(
    id: string,
    userId: string,
    updateOutfitDto: UpdateOutfitDto,
  ) {
    const outfit = await this.findOwnedOrFail(id, userId);

    if (updateOutfitDto.items !== undefined) {
      outfit.items = await this.buildItems(updateOutfitDto.items, userId);
    }

    if (updateOutfitDto.name !== undefined) {
      outfit.name = updateOutfitDto.name.trim();
    }

    if (updateOutfitDto.is_public !== undefined) {
      outfit.is_public = updateOutfitDto.is_public;
    }

    await outfit.save();

    const [view] = await this.toViews([outfit]);

    return {
      message: 'Outfit actualizado correctamente',
      outfit: view,
    };
  }

  async remove(id: string, userId: string) {
    const outfit = await this.findOwnedOrFail(id, userId);

    await this.outfitModel.findByIdAndDelete(outfit.id);

    return {
      message: 'Outfit eliminado correctamente',
    };
  }

  private async findByIdOrFail(id: string): Promise<OutfitDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(OUTFIT_NOT_FOUND);
    }

    const outfit = await this.outfitModel.findById(id);

    if (!outfit) {
      throw new NotFoundException(OUTFIT_NOT_FOUND);
    }

    return outfit;
  }

  private async findOwnedOrFail(
    id: string,
    userId: string,
  ): Promise<OutfitDocument> {
    const outfit = await this.findByIdOrFail(id);

    if (outfit.user_id !== userId) {
      throw new NotFoundException(OUTFIT_NOT_FOUND);
    }

    return outfit;
  }

  /**
   * Una prenda solo puede usarse si es del usuario o la tiene guardada, y
   * solo una por tipo. El tipo se toma del post, nunca del cliente.
   */
  private async buildItems(
    items: OutfitItemDto[],
    userId: string,
  ): Promise<{ post_id: Types.ObjectId; garment_type: GarmentType }[]> {
    const ids = items.map((item) => item.post_id);

    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('No puedes repetir una prenda');
    }

    const posts = await this.postModel
      .find({ _id: { $in: ids } })
      .select('garment_type user_id saved_by');

    const postsById = new Map<string, PostDocument>();

    for (const post of posts) {
      postsById.set(post.id, post);
    }

    const usedTypes = new Set<GarmentType>();

    return items.map((item) => {
      const post = postsById.get(item.post_id);

      if (!post) {
        throw new BadRequestException('Una de las prendas no existe');
      }

      if (post.user_id !== userId && !post.saved_by.includes(userId)) {
        throw new BadRequestException(
          'Solo puedes usar prendas tuyas o guardadas',
        );
      }

      if (usedTypes.has(post.garment_type)) {
        throw new BadRequestException(
          'Solo puedes elegir una prenda de cada tipo',
        );
      }

      usedTypes.add(post.garment_type);

      return {
        post_id: post._id,
        garment_type: post.garment_type,
      };
    });
  }

  /**
   * Resuelve las piezas contra sus posts. Una pieza sin post o que el dueño
   * ya no puede usar deja el outfit como no disponible.
   */
  private async toViews(outfits: OutfitDocument[]) {
    const postIds = outfits.flatMap((outfit) =>
      outfit.items.map((item) => item.post_id),
    );

    const posts = postIds.length
      ? await this.postModel
          .find({ _id: { $in: postIds } })
          .select('title image user_id saved_by category_ids')
      : [];

    const postsById = new Map<string, PostDocument>();

    for (const post of posts) {
      postsById.set(post.id, post);
    }

    return outfits.map((outfit) => {
      const categoryIds = new Set<string>();

      const items = outfit.items.map((item) => {
        const post = postsById.get(item.post_id.toString());

        const isAvailable =
          !!post &&
          (post.user_id === outfit.user_id ||
            post.saved_by.includes(outfit.user_id));

        if (post && isAvailable) {
          post.category_ids.forEach((id) => categoryIds.add(id.toString()));
        }

        return {
          post_id: item.post_id.toString(),
          garment_type: item.garment_type,
          title: post?.title ?? null,
          image: post?.image ?? null,
          is_available: isAvailable,
        };
      });

      return {
        _id: outfit.id,
        name: outfit.name,
        user_id: outfit.user_id,
        is_public: outfit.is_public,
        is_available: items.every((item) => item.is_available),
        category_ids: [...categoryIds],
        items,
        createdAt: outfit.createdAt,
        updatedAt: outfit.updatedAt,
      };
    });
  }
}
