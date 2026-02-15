import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

interface JwtPayload {
   sub: string;
   email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   constructor(configService: ConfigService) {
      super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         secretOrKey: configService.get<string>("ACCESS_TOKEN_SECRET"),
      });
   }

   validate(payload: JwtPayload) {
      return { userId: payload.sub, email: payload.email };
   }
}
