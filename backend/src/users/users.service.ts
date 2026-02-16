import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

@Injectable()
export class UsersService {
   constructor(private readonly prisma: PrismaService) {}

   async createUser(email: string, name: string, passwordHash: string) {
      return this.prisma.user.create({
         data: {
            email,
            name,
            passwordHash,
         },
      });
   }

   async findByEmail(email: string) {
      return this.prisma.user.findUnique({
         where: { email },
      });
   }

   async findById(id: string) {
      return this.prisma.user.findUnique({
         where: { id },
      });
   }

   async updateRefreshTokenHash(userId: string, refreshTokenHash: string) {
      return this.prisma.user.update({
         where: { id: userId },
         data: { refreshTokenHash },
      });
   }

   async clearRefreshTokenHash(userId: string) {
      return this.prisma.user.update({
         where: { id: userId },
         data: { refreshTokenHash: null },
      });
   }

   async updateSettings(userId: string, dto: UpdateSettingsDto) {
      return this.prisma.user.update({
         where: { id: userId },
         data: {
            dailyTargetNet: dto.dailyTargetNet ?? null,
            workDaysPerWeek: dto.workDaysPerWeek ?? null,
            hasWeeklyPlan: dto.hasWeeklyPlan ?? false,
         },
         select: {
            id: true,
            email: true,
            name: true,
            dailyTargetNet: true,
            workDaysPerWeek: true,
            hasWeeklyPlan: true,
         },
      });
   }
}
