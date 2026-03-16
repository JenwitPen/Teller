import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto, LogoutResponseDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiResponse({ type: LoginResponseDto, status: HttpStatus.OK, description: 'Successful login' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: LogoutResponseDto, status: HttpStatus.OK, description: 'Successful logout' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid or expired token' })
  async logout(@Req() req: any): Promise<LogoutResponseDto> {
    const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
    const username = req.user.username; // Populated by JwtStrategy
    await this.authService.logout(token, username);
    return { message: 'Logged out successfully' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token and invalidate old one' })
  @ApiResponse({ type: LoginResponseDto, status: HttpStatus.OK, description: 'Successful refresh' })
  async refresh(@Req() req: any): Promise<LoginResponseDto> {
    const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
    return this.authService.refresh(token, req.user);
  }
}
