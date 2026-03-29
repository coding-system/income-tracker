import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateServiceVisitDto } from "./dto/create-service-visit.dto";
import { ServicePartDto } from "./dto/service-part.dto";

@Injectable()
export class ServiceVisitsService {
   constructor(private readonly prisma: PrismaService) {}

   async listServiceVisits(userId: string) {
      return this.prisma.serviceVisit.findMany({
         where: { userId },
         orderBy: [{ date: "desc" }, { createdAt: "desc" }],
         include: {
            parts: {
               orderBy: { position: "asc" },
            },
         },
      });
   }

   async getServiceVisitById(userId: string, serviceVisitId: string) {
      return this.prisma.serviceVisit.findFirst({
         where: {
            id: serviceVisitId,
            userId,
         },
         include: {
            parts: {
               orderBy: { position: "asc" },
            },
         },
      });
   }

   async createServiceVisit(userId: string, dto: CreateServiceVisitDto) {
      const data = this.buildServiceVisitData(dto);

      return this.prisma.serviceVisit.create({
         data: {
            userId,
            ...data,
         },
         include: {
            parts: {
               orderBy: { position: "asc" },
            },
         },
      });
   }

   async updateServiceVisit(
      userId: string,
      serviceVisitId: string,
      dto: CreateServiceVisitDto,
   ) {
      const existing = await this.prisma.serviceVisit.findFirst({
         where: {
            id: serviceVisitId,
            userId,
         },
      });

      if (!existing) {
         return null;
      }

      const data = this.buildServiceVisitData(dto);

      return this.prisma.serviceVisit.update({
         where: { id: serviceVisitId },
         data: {
            ...data,
            parts: {
               deleteMany: {},
               create: this.mapParts(dto.parts),
            },
         },
         include: {
            parts: {
               orderBy: { position: "asc" },
            },
         },
      });
   }

   async deleteServiceVisit(userId: string, serviceVisitId: string) {
      const existing = await this.prisma.serviceVisit.findFirst({
         where: {
            id: serviceVisitId,
            userId,
         },
      });

      if (!existing) {
         return null;
      }

      return this.prisma.serviceVisit.delete({
         where: { id: serviceVisitId },
      });
   }

   private buildServiceVisitData(dto: CreateServiceVisitDto) {
      const totalCost = dto.workCost + this.sumParts(dto.parts);

      return {
         date: dto.date,
         mileageKm: dto.mileageKm,
         workCost: dto.workCost,
         totalCost,
         notes: dto.notes?.trim() || null,
         parts: {
            create: this.mapParts(dto.parts),
         },
      };
   }

   private mapParts(parts: ServicePartDto[]) {
      return parts.map((part, index) => ({
         position: index,
         name: part.name.trim(),
         isOriginal: part.isOriginal,
         unitCost: part.unitCost,
         quantity: part.quantity,
         totalCost: part.unitCost * part.quantity,
      }));
   }

   private sumParts(parts: ServicePartDto[]) {
      return parts.reduce(
         (total, part) => total + part.unitCost * part.quantity,
         0,
      );
   }
}
