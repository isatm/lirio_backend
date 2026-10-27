import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Report,
  ReportDocument,
} from './schema/report.schema.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { UpdateReportDto } from './dto/update-report.dto.js';

import {
  Post,
  PostDocument,
} from '../posts/schema/post.schema.js';
import {
  User,
  UserDocument,
} from '../users/schema/user.schema.js';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name)
    private readonly reportModel: Model<ReportDocument>,
    @InjectModel(Post.name)
    private readonly postModel: Model<PostDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(reporterId: string, createReportDto: CreateReportDto) {
    await this.ensureTargetExists(
      createReportDto.target_type,
      createReportDto.target_id,
    );

    const duplicated = await this.reportModel.findOne({
      reporter_id: reporterId,
      target_type: createReportDto.target_type,
      target_id: createReportDto.target_id,
      status: 'PENDING',
    });

    if (duplicated) {
      throw new ConflictException(
        'Ya existe un reporte tuyo pendiente para este contenido',
      );
    }

    const report = await this.reportModel.create({
      ...createReportDto,
      reporter_id: reporterId,
      status: 'PENDING',
    });

    return {
      message: 'Reporte enviado correctamente',
      report,
    };
  }

  async findAll(status?: string) {
    const filter = status ? { status } : {};

    const reports = await this.reportModel
      .find(filter)
      .sort({ createdAt: -1 });

    return Promise.all(
      reports.map((report) => this.enrich(report)),
    );
  }

  async findOne(id: string) {
    const report = await this.reportModel.findById(id);

    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    return this.enrich(report);
  }

  async update(id: string, updateReportDto: UpdateReportDto) {
    const report = await this.reportModel.findById(id);

    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    if (updateReportDto.action) {
      await this.applyAction(updateReportDto.action, report);
    }

    report.status = updateReportDto.status;
    await report.save();

    return {
      message: 'Reporte actualizado correctamente',
      report: await this.enrich(report),
    };
  }

  /** Adjunta los datos del contenido reportado para mostrarlo en el panel. */
  private async enrich(report: ReportDocument) {
    const plain = report.toObject();

    let target: Record<string, unknown> | null = null;

    if (report.target_type === 'POST') {
      const post = await this.postModel.findById(report.target_id);

      target = post
        ? {
            type: 'POST',
            title: post.title,
            image: post.image,
            ownerId: post.user_id,
          }
        : {
            type: 'POST',
            deleted: true,
          };
    } else {
      const user = await this.userModel
        .findById(report.target_id)
        .select('user_name');

      target = user
        ? {
            type: 'USER',
            userName: user.user_name,
          }
        : {
            type: 'USER',
            deleted: true,
          };
    }

    return {
      ...plain,
      target,
    };
  }

  private async ensureTargetExists(
    targetType: string,
    targetId: string,
  ) {
    if (targetType === 'POST') {
      const post = await this.postModel.findById(targetId);

      if (!post) {
        throw new NotFoundException('La publicación no existe');
      }

      return;
    }

    const user = await this.userModel.findById(targetId);

    if (!user) {
      throw new NotFoundException('El usuario no existe');
    }
  }

  private async applyAction(
    action: string,
    report: ReportDocument,
  ) {
    if (action === 'DELETE_POST' && report.target_type === 'POST') {
      await this.postModel.findByIdAndDelete(report.target_id);
      return;
    }

    if (action === 'DELETE_USER' && report.target_type === 'USER') {
      await this.postModel.deleteMany({
        user_id: report.target_id,
      });
      await this.userModel.findByIdAndDelete(report.target_id);
      return;
    }

    throw new ConflictException(
      'La acción no corresponde al contenido reportado',
    );
  }
}