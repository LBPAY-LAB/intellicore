import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

export interface JwtPayload {
  sub: string;
  email?: string;
  preferred_username?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const keycloakUrl = configService.get<string>('KEYCLOAK_URL');
    const keycloakRealm = configService.get<string>('KEYCLOAK_REALM');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`,
      }),
      audience: configService.get<string>('KEYCLOAK_CLIENT_ID'),
      issuer: `${keycloakUrl}/realms/${keycloakRealm}`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token');
    }

    // Extract roles from Keycloak token
    const realmRoles = payload.realm_access?.roles || [];
    const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID') || '';
    const clientRoles = payload.resource_access?.[clientId]?.roles || [];

    return {
      userId: payload.sub,
      email: payload.email,
      username: payload.preferred_username,
      roles: [...realmRoles, ...clientRoles],
    };
  }
}
