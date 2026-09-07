import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './schema/user.schema.js';
import { RegisterUserDto } from './dto/register_dto.js';

import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login_dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
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
    });

    return {
      message: 'Usuario registrado correctamente',
      user: {
        id: user._id,
        email: user.email,
        user_name: user.user_name,
      },
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordCorrect) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    return {
      message: 'Usuario logueado correctamente',
      user: {
        id: user._id,
        email: user.email,
        user_name: user.user_name,
      },
    };

  }
}