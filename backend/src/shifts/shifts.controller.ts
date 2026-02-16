import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CreateShiftDto } from "./dto/create-shift.dto";
import { ShiftsService } from "./shifts.service";

@Controller("shifts")
@UseGuards(JwtAuthGuard)
export class ShiftsController {
   constructor(private readonly shiftsService: ShiftsService) {}

   @Get()
   listShifts(@CurrentUser() user: { userId: string }) {
      return this.shiftsService.listShifts(user.userId);
   }

   @Post()
   createShift(
      @CurrentUser() user: { userId: string },
      @Body() dto: CreateShiftDto,
   ) {
      return this.shiftsService.createShift(user.userId, dto);
   }
}
