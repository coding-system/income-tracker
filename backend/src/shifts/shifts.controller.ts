import {
   Body,
   Controller,
   Get,
   NotFoundException,
   Param,
   Post,
   UseGuards,
} from "@nestjs/common";
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

   @Get(":id")
   async getShift(
      @CurrentUser() user: { userId: string },
      @Param("id") id: string,
   ) {
      const shift = await this.shiftsService.getShiftById(user.userId, id);
      if (!shift) {
         throw new NotFoundException("Shift not found");
      }

      return shift;
   }

   @Post()
   createShift(
      @CurrentUser() user: { userId: string },
      @Body() dto: CreateShiftDto,
   ) {
      return this.shiftsService.createShift(user.userId, dto);
   }
}
