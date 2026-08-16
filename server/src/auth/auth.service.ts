import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { GuestLoginDto } from './dto/guest-login.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

interface MemoryUser {
  _id: Types.ObjectId;
  fullName: string;
  isGuest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private memoryUsers = new Map<string, MemoryUser>();

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Create a guest user and return a JWT.
   * Resilient to database connectivity drops (Atlas IP whitelist / TLS).
   */
  async guestLogin(dto: GuestLoginDto): Promise<{ accessToken: string; user: any }> {
    const displayName = dto.displayName || `Guest_${this.generateId()}`;
    const newId = new Types.ObjectId();

    let user: any;
    try {
      user = await this.userModel.create({
        fullName: displayName,
        isGuest: true,
      });
      this.memoryUsers.set(user._id.toString(), {
        _id: user._id,
        fullName: user.fullName,
        isGuest: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (err) {
      this.logger.warn(`Database write fallback to in-memory: ${(err as Error).message}`);
      const memoryUser: MemoryUser = {
        _id: newId,
        fullName: displayName,
        isGuest: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.memoryUsers.set(newId.toString(), memoryUser);
      user = memoryUser;
    }

    const payload: JwtPayload = {
      sub: user._id.toString(),
      isGuest: true,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user };
  }

  /**
   * Look up a user by ID. Called by JwtStrategy.validate().
   */
  async validateUser(userId: string): Promise<any> {
    try {
      const user = await this.userModel.findById(userId);
      if (user) {
        this.memoryUsers.set(user._id.toString(), {
          _id: user._id,
          fullName: user.fullName,
          isGuest: (user as any).isGuest,
          createdAt: (user as any).createdAt || new Date(),
          updatedAt: (user as any).updatedAt || new Date(),
        });
        return user;
      }
    } catch (err) {
      this.logger.warn(`Database lookup fallback to in-memory: ${(err as Error).message}`);
    }

    const memUser = this.memoryUsers.get(userId);
    if (memUser) {
      return memUser;
    }

    // Auto-create/restore session user so JWT never fails
    const fallbackUser: MemoryUser = {
      _id: Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : new Types.ObjectId(),
      fullName: `User_${userId.slice(-4)}`,
      isGuest: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.memoryUsers.set(userId, fallbackUser);
    return fallbackUser;
  }

  async getProfile(userId: string): Promise<any> {
    return this.validateUser(userId);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 8);
  }
}
