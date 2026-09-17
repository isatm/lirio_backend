import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    private readonly jwtService: JwtService,
  ) {}

  generateToken(user: {
    id: string;
    email: string;
    user_name: string;
    role: string;
  }) {

    const payload = {
      sub: user.id,
      email: user.email,
      user_name: user.user_name,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

}