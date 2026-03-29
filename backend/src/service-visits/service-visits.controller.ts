import {
   Body,
   Controller,
   Delete,
   Get,
   NotFoundException,
   Param,
   Patch,
   Post,
   UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CreateServiceVisitDto } from "./dto/create-service-visit.dto";
import { ServiceVisitsService } from "./service-visits.service";

@Controller("service-visits")
@UseGuards(JwtAuthGuard)
export class ServiceVisitsController {
   constructor(private readonly serviceVisitsService: ServiceVisitsService) {}

   @Get()
   listServiceVisits(@CurrentUser() user: { userId: string }) {
      return this.serviceVisitsService.listServiceVisits(user.userId);
   }

   @Get(":id")
   async getServiceVisit(
      @CurrentUser() user: { userId: string },
      @Param("id") id: string,
   ) {
      const serviceVisit = await this.serviceVisitsService.getServiceVisitById(
         user.userId,
         id,
      );

      if (!serviceVisit) {
         throw new NotFoundException("Service visit not found");
      }

      return serviceVisit;
   }

   @Post()
   createServiceVisit(
      @CurrentUser() user: { userId: string },
      @Body() dto: CreateServiceVisitDto,
   ) {
      return this.serviceVisitsService.createServiceVisit(user.userId, dto);
   }

   @Patch(":id")
   async updateServiceVisit(
      @CurrentUser() user: { userId: string },
      @Param("id") id: string,
      @Body() dto: CreateServiceVisitDto,
   ) {
      const serviceVisit = await this.serviceVisitsService.updateServiceVisit(
         user.userId,
         id,
         dto,
      );

      if (!serviceVisit) {
         throw new NotFoundException("Service visit not found");
      }

      return serviceVisit;
   }

   @Delete(":id")
   async deleteServiceVisit(
      @CurrentUser() user: { userId: string },
      @Param("id") id: string,
   ) {
      const serviceVisit = await this.serviceVisitsService.deleteServiceVisit(
         user.userId,
         id,
      );

      if (!serviceVisit) {
         throw new NotFoundException("Service visit not found");
      }

      return serviceVisit;
   }
}
