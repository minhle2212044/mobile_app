import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          name: dto.name,
          tel: dto.tel,
          dob: dto.dob ? new Date(dto.dob) : new Date(),
          address: dto.address || '',
          gender: dto.gender || 'Male',
          role: dto.role || 'CUSTOMER',
        },
      });

      if (dto.role === 'COLLECTOR') {
        await this.prisma.collector.create({
          data: {
            license: dto.license || '',
            user: {
              connect: { id: user.id },
            },
          },
        });
      } else if (dto.role === 'CUSTOMER') {
        await this.prisma.customer.create({
          data: {
            points: 0,
            user: {
              connect: { id: user.id },
            },
          },
        });
      }

      return { message: 'User registered successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    const token = await this.signToken(user.id, user.email);
    const refresh_token = await this.refreshToken(user.id, user.email);

    return {
      user: user.id,
      access_token: token.access_token,
      refresh_token: refresh_token,
      message: 'Login successful',
    };
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }

  async reSignAccessToken(refresh_token: string): Promise<{ access_token: string }> {
        try {
            const payload = (await this.jwt.verifyAsync(refresh_token, {
                secret: process.env.REFRESH_TOKEN_SECRET,
            }))

            return await this.signToken(payload.sub, payload.email);
        } catch (err) {
            throw new ForbiddenException(err);
        }
    }


  async refreshToken(id: number, email: string): Promise<string> {
        let user = await this.prisma.user.findUnique({
            where: {
                id: id
            }
        })

        if (!user) {
            throw new ForbiddenException("Cannot find the user")
        }

        const secret = process.env.REFRESH_TOKEN_SECRET

        const payload = {
            sub: id,
            email
        }

        try {
            const token = await this.jwt.signAsync(payload, {
                expiresIn: '15m',
                secret: secret
            })

            user = await this.prisma.user.update({
                where: {
                    id: id
                },
                data: {
                    accessToken: token
                }
            })

            return token
        } catch (err) {
            throw new ForbiddenException(err)
        }
    }
}