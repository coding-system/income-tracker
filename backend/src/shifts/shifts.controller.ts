import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CreateShiftDto } from "./dto/create-shift.dto";
import { ShiftsService } from "./shifts.service";

@Controller("shifts")
@UseGuards(JwtAuthGuard)
export class ShiftsController {
   constructor(private readonly shiftsService: ShiftsService) {}

   @Post()
   createShift(
      @CurrentUser() user: { userId: string },
      @Body() dto: CreateShiftDto,
   ) {
      return this.shiftsService.createShift(user.userId, dto);
   }
}
