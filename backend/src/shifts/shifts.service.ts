import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateShiftDto } from "./dto/create-shift.dto";

@Injectable()
export class ShiftsService {
   constructor(private readonly prisma: PrismaService) {}

   async listShifts(userId: string) {
      return this.prisma.day.findMany({
         where: { userId },
         orderBy: { date: "desc" },
         include: {
            fuelings: true,
            washes: true,
            snacks: true,
         },
      });
   }

   async createShift(userId: string, dto: CreateShiftDto) {
      const { fuelings = [], washes = [], snacks = [], ...dayData } = dto;

      return this.prisma.day.upsert({
         where: {
            userId_date: {
               userId,
               date: dayData.date,
            },
         },
         create: {
            ...dayData,
            userId,
            fuelings: {
               create: fuelings.map((costTotal) => ({ costTotal })),
            },
            washes: {
               create: washes.map((costTotal) => ({ costTotal })),
            },
            snacks: {
               create: snacks.map((costTotal) => ({ costTotal })),
            },
         },
         update: {
            ...dayData,
            fuelings: {
               deleteMany: {},
               create: fuelings.map((costTotal) => ({ costTotal })),
            },
            washes: {
               deleteMany: {},
               create: washes.map((costTotal) => ({ costTotal })),
            },
            snacks: {
               deleteMany: {},
               create: snacks.map((costTotal) => ({ costTotal })),
            },
         },
         include: {
            fuelings: true,
            washes: true,
            snacks: true,
         },
      });
   }
}
