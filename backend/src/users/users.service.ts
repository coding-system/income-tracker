import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

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
}
