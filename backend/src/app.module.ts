import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ServiceVisitsModule } from "./service-visits/service-visits.module";
import { ShiftsModule } from "./shifts/shifts.module";
import { UsersModule } from "./users/users.module";

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
      }),
      PrismaModule,
      UsersModule,
      AuthModule,
      ShiftsModule,
      ServiceVisitsModule,
   ],
   controllers: [AppController],
   providers: [AppService],
})
export class AppModule {}
