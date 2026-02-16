import { Body, Controller, Patch, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UpdateSettingsDto } from "./dto/update-settings.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
   constructor(private readonly usersService: UsersService) {}

   @UseGuards(JwtAuthGuard)
   @Patch("settings")
   updateSettings(
      @CurrentUser() user: { userId: string },
      @Body() dto: UpdateSettingsDto,
   ) {
      return this.usersService.updateSettings(user.userId, dto);
   }
}
