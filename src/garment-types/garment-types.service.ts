import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GarmentType, GarmentTypeDocument } from './schema/garment-type.schema.js';
import { CreateGarmentTypeDto } from './dto/create_garment_type.dto.js';
import { UpdateGarmentTypeDto } from './dto/update_garment_type.dto.js';

import { Post, PostDocument } from '../posts/schema/post.schema.js';
import { Outfit, OutfitDocument } from '../outfits/schema/outfit.schema.js';

const LEGACY_GARMENT_TYPES: Record<string, string> = {
  SHIRT: 'Camiseta',
  PANTS: 'Pantalón',
  SHOES: 'Zapato',
};

@Injectable()
export class GarmentTypesService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(GarmentType.name)
    private readonly garmentTypeModel: Model<GarmentTypeDocument>,
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
    @InjectModel(Outfit.name)
    private readonly outfitModel: Model<OutfitDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.migrateLegacyTypes();
  }

  async create(createGarmentTypeDto: CreateGarmentTypeDto) {
    await this.ensureNameIsFree(createGarmentTypeDto.name);

    return this.garmentTypeModel.create({
      name: createGarmentTypeDto.name.trim(),
    });
  }

  async findAll() {
    return this.garmentTypeModel.find().sort({ createdAt: 1 });
  }

  async findOne(id: string) {
    const garmentType = await this.garmentTypeModel.findById(id);

    if (!garmentType) {
      throw new NotFoundException('Tipo de prenda no encontrado');
    }

    return garmentType;
  }

  async ensureExists(id: string) {
    const exists = await this.garmentTypeModel.exists({ _id: id });

    if (!exists) {
      throw new BadRequestException('Tipo de prenda no válido');
    }
  }

  async update(id: string, updateGarmentTypeDto: UpdateGarmentTypeDto) {
    await this.findOne(id);

    if (updateGarmentTypeDto.name) {
      await this.ensureNameIsFree(updateGarmentTypeDto.name, id);
    }

    return this.garmentTypeModel.findByIdAndUpdate(
      id,
      { name: updateGarmentTypeDto.name?.trim() },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  async remove(id: string) {
    const garmentType = await this.findOne(id);

    const [postCount, outfitCount] = await Promise.all([
      this.postModel.countDocuments({ garment_type_id: garmentType._id }),
      this.outfitModel.countDocuments({
        'items.garment_type_id': garmentType._id,
      }),
    ]);

    if (postCount > 0 || outfitCount > 0) {
      throw new ConflictException(
        `No se puede eliminar: lo usan ${postCount} prenda(s) y ${outfitCount} outfit(s)`,
      );
    }

    await this.garmentTypeModel.findByIdAndDelete(id);

    return {
      message: 'Tipo de prenda eliminado correctamente',
    };
  }

  /**
   * Pasa los posts y outfits guardados con el enum antiguo (SHIRT, PANTS,
   * SHOES) a referencias de `garment_types`. Solo actúa si quedan datos antiguos.
   */
  private async migrateLegacyTypes() {
    const postsCollection = this.postModel.collection;
    const outfitsCollection = this.outfitModel.collection;

    for (const [key, name] of Object.entries(LEGACY_GARMENT_TYPES)) {
      const legacyCount =
        (await postsCollection.countDocuments({ garment_type: key })) +
        (await outfitsCollection.countDocuments({ 'items.garment_type': key }));

      if (legacyCount === 0) {
        continue;
      }

      const garmentType = await this.garmentTypeModel.findOneAndUpdate(
        { name },
        { $setOnInsert: { name } },
        { upsert: true, new: true },
      );

      await postsCollection.updateMany(
        { garment_type: key },
        {
          $set: { garment_type_id: garmentType._id },
          $unset: { garment_type: '' },
        },
      );

      await outfitsCollection.updateMany(
        { 'items.garment_type': key },
        {
          $set: { 'items.$[item].garment_type_id': garmentType._id },
          $unset: { 'items.$[item].garment_type': '' },
        },
        { arrayFilters: [{ 'item.garment_type': key }] },
      );
    }
  }

  /** Verifica que el nombre no lo use otro tipo (ignorando mayúsculas). */
  private async ensureNameIsFree(name: string, excludeId?: string) {
    const existing = await this.garmentTypeModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      _id: { $ne: excludeId },
    });

    if (existing) {
      throw new ConflictException('Ya existe un tipo de prenda con ese nombre');
    }
  }
}
