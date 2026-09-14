import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Category, CategoryDocument } from './schema/category.schema.js';
import { CreateCategoryDto } from './dto/create_category.dto.js';
import { UpdateCategoryDto } from './dto/update_category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    await this.ensureNameIsFree(createCategoryDto.name);

    const category = await this.categoryModel.create({
      name: createCategoryDto.name.trim(),
    });

    return category;
  }

  async findAll() {
    return this.categoryModel.find().sort({ name: 1 });
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    if (updateCategoryDto.name) {
      await this.ensureNameIsFree(updateCategoryDto.name, id);
    }

    return this.categoryModel
      .findByIdAndUpdate(
        id,
        { name: updateCategoryDto.name?.trim() },
        {
          new: true,
          runValidators: true,
        },
      );
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.categoryModel.findByIdAndDelete(id);

    return {
      message: 'Categoría eliminada correctamente',
    };
  }

  /** Verifica que el nombre no lo use otra categoría (ignorando mayúsculas). */
  private async ensureNameIsFree(name: string, excludeId?: string) {
    const existing = await this.categoryModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      _id: { $ne: excludeId },
    });

    if (existing) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }
  }
}