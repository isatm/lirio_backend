import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from './schema/user.schema.js';
import { RegisterUserDto } from './dto/register_dto.js';
import { CreateUserDto } from './dto/create_user.dto.js';
import { UpdateUserDto } from './dto/update_user.dto.js';

import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login_dto.js';

import { AuthService } from '../auth/auth.service.js';
import { PostsService } from '../posts/posts.service.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly authService: AuthService,
    private readonly postsService: PostsService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const { email, user_name, password } = registerUserDto;

    const existingUser = await this.userModel.findOne({
      $or: [
        { email },
        { user_name },
      ],
    });

    if (existingUser) {
      throw new ConflictException(
        'El email o nombre de usuario ya está registrado',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      email,
      user_name,
      password: hashedPassword,
      bio: registerUserDto.bio ?? '',
      preferred_categories: registerUserDto.preferred_categories ?? [],
    });

    return {
      message: 'Usuario registrado correctamente',
      user: {
        id: user._id,
        email: user.email,
        user_name: user.user_name,
        bio: user.bio,
        preferred_categories: user.preferred_categories,
      },
    };
  }

async login(loginUserDto: LoginUserDto) {
  const { email, password } = loginUserDto;

  const user = await this.userModel.findOne({ email });

  if (!user) {
    throw new UnauthorizedException(
      'Email o contraseña incorrectos',
    );
  }

  const passwordCorrect = await bcrypt.compare(
    password,
    user.password,
  );

  if (!passwordCorrect) {
    throw new UnauthorizedException(
      'Email o contraseña incorrectos',
    );
  }

  const accessToken = this.authService.generateToken({
    id: user._id.toString(),
    email: user.email,
    user_name: user.user_name,
    role: user.role,
  });

  return {
    message: 'Inicio de sesión exitoso',
    access_token: accessToken,
    user: {
      id: user._id,
      email: user.email,
      user_name: user.user_name,
      role: user.role,
      bio: user.bio,
      preferred_categories: user.preferred_categories,
    },
  };
}

  async findAll() {
    return this.userModel.find().select('-password');
  }

  /** Busca cuentas por nombre de usuario, correo o bio. */
  async search(q: string, limit?: number) {
    const term = q.trim();
    const size = Math.min(Math.max(limit ?? 10, 1), 20);

    if (!term) {
      return [];
    }

    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    return this.userModel
      .find({
        $or: [
          { user_name: regex },
          { email: regex },
          { bio: regex },
        ],
      })
      .select('-password')
      .limit(size);
  }

  /**
   * Cuentas sugeridas: primero las que comparten categorías preferidas
   * con el usuario actual (máximo 4) y se completa con cuentas aleatorias.
   */
  async suggestions(limit: number, currentUserId?: string) {
    const size = Math.min(Math.max(limit, 1), 20);
    const prefCount = Math.min(size, 4);

    let matched: any[] = [];
    let currentObjectId: Types.ObjectId | null = null;

    if (currentUserId) {
      currentObjectId = new Types.ObjectId(currentUserId);
    }

    if (currentObjectId) {
      const current = await this.userModel
        .findById(currentObjectId)
        .select('preferred_categories');

      const preferred = current?.preferred_categories ?? [];

      if (preferred.length > 0) {
        matched = await this.userModel.aggregate([
          {
            $match: {
              _id: { $ne: currentObjectId },
              preferred_categories: { $in: preferred },
            },
          },
          {
            $addFields: {
              matches: {
                $size: {
                  $setIntersection: ['$preferred_categories', preferred],
                },
              },
            },
          },
          { $sort: { matches: -1, createdAt: -1 } },
          { $limit: prefCount },
          { $project: { password: 0 } },
        ]);
      }
    }

    const matchedIds = matched.map((user) => user._id);

    const random = await this.userModel.aggregate([
      {
        $match: {
          ...(currentObjectId
            ? { _id: { $nin: [currentObjectId, ...matchedIds] } }
            : {}),
        },
      },
      { $sample: { size: Math.max(size - matchedIds.length, 0) } },
      { $project: { password: 0 } },
    ]);

    return [...matched, ...random].slice(0, size);
  }

  async findOne(id: string) {
    return this.userModel.findById(id).select('-password');
  }

  /** El administrador crea cuentas con el rol que elija. */
  async createByAdmin(createUserDto: CreateUserDto) {
    const { email, user_name, password, role } = createUserDto;

    await this.ensureCredentialsFree(email, user_name);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      email: email.toLowerCase(),
      user_name: user_name.trim(),
      password: hashedPassword,
      role,
    });

    return {
      message: 'Usuario creado correctamente',
      user: {
        id: user._id,
        email: user.email,
        user_name: user.user_name,
        role: user.role,
      },
    };
  }

  async update(id: string, data: UpdateUserDto) {
    const conditions: Record<string, string>[] = [];

    if (data.email) {
      conditions.push({ email: data.email });
    }

    if (data.user_name) {
      conditions.push({ user_name: data.user_name });
    }

    if (conditions.length > 0) {
      const existing = await this.userModel.findOne({
        $or: conditions,
        _id: { $ne: id },
      });

      if (existing) {
        throw new ConflictException(
          'El email o nombre de usuario ya está registrado',
        );
      }
    }

    const update: Partial<User> = {};

    if (data.user_name !== undefined) {
      update.user_name = data.user_name.trim();
    }

    if (data.email !== undefined) {
      update.email = data.email.toLowerCase();
    }

    if (data.role !== undefined) {
      update.role = data.role;
    }

    return this.userModel
      .findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
      })
      .select('-password');
  }

  /** Verifica que el email o el nombre de usuario no estén en uso. */
  private async ensureCredentialsFree(email?: string, userName?: string) {
    const conditions: Record<string, string>[] = [];

    if (email) {
      conditions.push({ email: email.toLowerCase() });
    }

    if (userName) {
      conditions.push({ user_name: userName.trim() });
    }

    if (conditions.length === 0) {
      return;
    }

    const existing = await this.userModel.findOne({ $or: conditions });

    if (existing) {
      throw new ConflictException(
        'El email o nombre de usuario ya está registrado',
      );
    }
  }

  async updateProfile(
    id: string,
    data: {
      user_name?: string;
      email?: string;
      bio?: string;
    },
  ) {
    const conditions: Record<string, string>[] = [];

    if (data.email) {
      conditions.push({ email: data.email });
    }

    if (data.user_name) {
      conditions.push({ user_name: data.user_name });
    }

    if (conditions.length > 0) {
      const existing = await this.userModel.findOne({
        $or: conditions,
        _id: { $ne: id },
      });

      if (existing) {
        throw new ConflictException(
          'El email o nombre de usuario ya está registrado',
        );
      }
    }

    const update: Partial<User> = {};

    if (data.user_name !== undefined) {
      update.user_name = data.user_name;
    }

    if (data.email !== undefined) {
      update.email = data.email;
    }

    if (data.bio !== undefined) {
      update.bio = data.bio;
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
      })
      .select('-password');

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async updatePassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userModel.findByIdAndUpdate(id, {
      password: hashedPassword,
    });

    return {
      message: 'Contraseña actualizada correctamente',
    };
  }

  async removeAccount(id: string) {
    await this.postsService.removeAllByUser(id);

    return this.remove(id);
  }

  async remove(id: string) {
    await this.userModel.findByIdAndDelete(id);

    return {
      message: 'Usuario eliminado correctamente',
    };
  }

}