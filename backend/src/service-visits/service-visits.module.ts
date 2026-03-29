import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ServiceVisitsController } from "./service-visits.controller";
import { ServiceVisitsService } from "./service-visits.service";

@Module({
   imports: [PrismaModule],
   controllers: [ServiceVisitsController],
   providers: [ServiceVisitsService],
})
export class ServiceVisitsModule {}
