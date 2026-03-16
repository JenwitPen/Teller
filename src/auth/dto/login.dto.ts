import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class LoginResponseDto {
  @ApiProperty()
  access_token!: string;

  @ApiProperty({ example: 'ADMIN', enum: ['ADMIN', 'TELLER'] })
  role?: string;
}

export class LogoutResponseDto {
  @ApiProperty({ example: 'Logged out successfully' })
  message!: string;
}
