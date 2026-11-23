import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Follow, FollowDocument } from '../schema/follow.schema.js';
import { User, UserDocument } from '../../users/schema/user.schema.js';

@Injectable()
export class FollowsService {
    constructor(
    @InjectModel(Follow.name)
    private readonly followModel: Model<FollowDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    ) {}

  /** Convierte un texto en ObjectId o rechaza el valor. */
    private toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Identificador no válido');
    }
    return new Types.ObjectId(id);
    }

  /** Cuenta los seguidores de un usuario. */
    private countFollowers(userId: Types.ObjectId) {
    return this.followModel.countDocuments({ following: userId });
    }

  /** Sigue a un usuario. Si ya lo seguía no hace nada. */
    async follow(currentUserId: string, targetId: string) {
    const me = this.toObjectId(currentUserId);
    const target = this.toObjectId(targetId);

    if (me.equals(target)) {
        throw new BadRequestException('No puedes seguirte a ti mismo');
    }

    const targetExists = await this.userModel.exists({ _id: target });
    if (!targetExists) {
        throw new NotFoundException('Usuario no encontrado');
    }

    // El upsert es atómico y el índice único evita duplicados.
    await this.followModel.updateOne(
        { follower: me, following: target },
        { $setOnInsert: { follower: me, following: target } },
        { upsert: true },
    );

    return {
        following: true,
        followersCount: await this.countFollowers(target),
    };
    }

  /** Deja de seguir a un usuario. Si no lo seguía no hace nada. */
    async unfollow(currentUserId: string, targetId: string) {
    const me = this.toObjectId(currentUserId);
    const target = this.toObjectId(targetId);

    await this.followModel.deleteOne({ follower: me, following: target });

    return {
        following: false,
        followersCount: await this.countFollowers(target),
    };
    }

  /** Estado de un perfil: si lo sigo y sus contadores. */
    async getStatus(currentUserId: string, targetId: string) {
    const me = this.toObjectId(currentUserId);
    const target = this.toObjectId(targetId);

    const [relation, followersCount, followingCount] = await Promise.all([
        this.followModel.exists({ follower: me, following: target }),
        this.countFollowers(target),
        this.followModel.countDocuments({ follower: target }),
    ]);

    return {
        following: !!relation,
        followersCount,
        followingCount,
    };
    }

  /** Lista paginada de quienes siguen a un usuario, del más reciente al más antiguo. */
    async listFollowers(targetId: string, page = 1, limit = 20) {
    const target = this.toObjectId(targetId);
    const size = Math.min(Math.max(limit, 1), 50);
    const current = Math.max(page, 1);

    const [rows, total] = await Promise.all([
        this.followModel
        .find({ following: target })
        .sort({ createdAt: -1 })
        .skip((current - 1) * size)
        .limit(size)
        .populate<{ follower: Pick<UserDocument, '_id' | 'user_name' | 'avatar_url'> | null }>(
            'follower',
            'user_name avatar_url',
        )
        .lean(),
        this.countFollowers(target),
    ]);

    // Se descartan cuentas borradas que aún tengan registro.
    const items = rows
        .filter((row) => row.follower)
        .map((row) => ({
        id: row.follower!._id.toString(),
        user_name: row.follower!.user_name,
        avatar_url: row.follower!.avatar_url ?? '',
        }));

    return {
        items,
        total,
        page: current,
      hasMore: current * size < total,
    };
    }

  /** Ids de las cuentas que sigue el usuario actual, para pintar los botones. */
    async listFollowingIds(currentUserId: string) {
    const me = this.toObjectId(currentUserId);

    const rows = await this.followModel
        .find({ follower: me })
        .select('following -_id')
        .lean();

    return rows.map((row) => row.following.toString());
    }

  /** Borra todos los registros de un usuario al eliminar su cuenta. */
    async removeAllByUser(userId: string) {
    const id = this.toObjectId(userId);

    await this.followModel.deleteMany({
        $or: [{ follower: id }, { following: id }],
    });
    }
}