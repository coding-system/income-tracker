import {
   ConflictException,
   Injectable,
   UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { StringValue } from "ms";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RegisterDto } from "./dto/register.dto";

export interface TokenPair {
   accessToken: string;
   refreshToken: string;
}

@Injectable()
export class AuthService {
   constructor(
      private readonly usersService: UsersService,
      private readonly jwtService: JwtService,
      private readonly configService: ConfigService,
   ) {}

   async register(dto: RegisterDto): Promise<TokenPair> {
      const existing = await this.usersService.findByEmail(dto.email);
      if (existing) {
         throw new ConflictException("Email already registered");
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = await this.usersService.createUser(
         dto.email,
         dto.name,
         passwordHash,
      );
      const tokens = await this.signTokens(user.id, user.email);
      const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
      await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);

      return tokens;
   }

   async login(dto: LoginDto): Promise<TokenPair> {
      const user = await this.usersService.findByEmail(dto.email);
      if (!user) {
         throw new UnauthorizedException("Invalid credentials");
      }

      const passwordMatches = await bcrypt.compare(
         dto.password,
         user.passwordHash,
      );
      if (!passwordMatches) {
         throw new UnauthorizedException("Invalid credentials");
      }

      const tokens = await this.signTokens(user.id, user.email);
      const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
      await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);

      return tokens;
   }

   async refresh(dto: RefreshDto): Promise<TokenPair> {
      const refreshSecret = this.configService.get<string>(
         "REFRESH_TOKEN_SECRET",
      );

      let payload: { sub: string; email: string };
      try {
         payload = await this.jwtService.verifyAsync(dto.refreshToken, {
            secret: refreshSecret,
         });
      } catch {
         throw new UnauthorizedException("Invalid refresh token");
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.refreshTokenHash) {
         throw new UnauthorizedException("Invalid refresh token");
      }

      const tokenMatches = await bcrypt.compare(
         dto.refreshToken,
         user.refreshTokenHash,
      );
      if (!tokenMatches) {
         throw new UnauthorizedException("Invalid refresh token");
      }

      const tokens = await this.signTokens(user.id, user.email);
      const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
      await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);

      return tokens;
   }

   async logout(userId: string): Promise<{ success: true }> {
      await this.usersService.clearRefreshTokenHash(userId);
      return { success: true };
   }

   private async signTokens(userId: string, email: string): Promise<TokenPair> {
      const accessExpires = (this.configService.get<string>(
         "ACCESS_TOKEN_EXPIRES",
      ) ?? "15m") as StringValue;
      const refreshExpires = (this.configService.get<string>(
         "REFRESH_TOKEN_EXPIRES",
      ) ?? "7d") as StringValue;

      const accessToken = await this.jwtService.signAsync(
         { sub: userId, email },
         {
            secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
            expiresIn: accessExpires,
         },
      );

      const refreshToken = await this.jwtService.signAsync(
         { sub: userId, email },
         {
            secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
            expiresIn: refreshExpires,
         },
      );

      return { accessToken, refreshToken };
   }
}
