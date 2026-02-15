import {
   Body,
   Controller,
   Get,
   Post,
   UnauthorizedException,
   UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthService, TokenPair } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { RegisterDto } from "./dto/register.dto";
import { UsersService } from "../users/users.service";

@Controller("auth")
export class AuthController {
   constructor(
      private readonly authService: AuthService,
      private readonly usersService: UsersService,
   ) {}

   @Post("register")
   register(@Body() dto: RegisterDto): Promise<TokenPair> {
      return this.authService.register(dto);
   }

   @Post("login")
   login(@Body() dto: LoginDto): Promise<TokenPair> {
      return this.authService.login(dto);
   }

   @Post("refresh")
   refresh(@Body() dto: RefreshDto): Promise<TokenPair> {
      return this.authService.refresh(dto);
   }

   @UseGuards(JwtAuthGuard)
   @Post("logout")
   logout(@CurrentUser() user: { userId: string }) {
      return this.authService.logout(user.userId);
   }

   @UseGuards(JwtAuthGuard)
   @Get("me")
   async me(@CurrentUser() user: { userId: string }) {
      const profile = await this.usersService.findById(user.userId);
      if (!profile) {
         throw new UnauthorizedException("User not found");
      }

      return {
         userId: profile.id,
         email: profile.email,
         name: profile.name,
      };
   }
}
