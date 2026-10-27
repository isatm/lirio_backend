
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Garment,
  GarmentDocument,
} from './schema/garment.schema.js';

import { CreateGarmentDto } from './dto/create_garment.dto.js';
import { UpdateGarmentDto } from './dto/update_garment.dto.js';

@Injectable()
export class GarmentsService {
  constructor(
    @InjectModel(Garment.name)
    private readonly garmentModel: Model<GarmentDocument>,
  ) {}

  async create(
    createGarmentDto: CreateGarmentDto,
    userId: string,
    imageUrl: string,
  ) {
    const garment = await this.garmentModel.create({
      ...createGarmentDto,
      name: createGarmentDto.name.trim(),
      category: createGarmentDto.category.trim(),
      color: createGarmentDto.color?.trim(),
      image: imageUrl,
      user_id: userId,
    });

    return {
      message: 'Prenda creada correctamente',
      garment,
    };
  }

  async findMyGarments(userId: string) {
    return this.garmentModel
      .find({ user_id: userId })
      .sort({ createdAt: -1 });
  }

  async findOne(id: string, userId: string) {
    const garment = await this.garmentModel.findById(id);

    if (!garment) {
      throw new NotFoundException('Prenda no encontrada');
    }

    if (garment.user_id !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para ver esta prenda',
      );
    }

    return garment;
  }

  async update(
    id: string,
    userId: string,
    updateGarmentDto: UpdateGarmentDto,
    imageUrl?: string,
  ) {
    const garment = await this.findOne(id, userId);

    if (updateGarmentDto.name !== undefined) {
      garment.name = updateGarmentDto.name.trim();
    }

    if (updateGarmentDto.category !== undefined) {
      garment.category = updateGarmentDto.category.trim();
    }

    if (updateGarmentDto.color !== undefined) {
      garment.color = updateGarmentDto.color.trim();
    }

    if (imageUrl) {
      garment.image = imageUrl;
    }

    await garment.save();

    return {
      message: 'Prenda actualizada correctamente',
      garment,
    };
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.garmentModel.findByIdAndDelete(id);

    return {
      message: 'Prenda eliminada correctamente',
    };
  }
}
