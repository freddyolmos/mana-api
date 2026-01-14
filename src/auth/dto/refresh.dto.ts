import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ example: 'REFRESH_TOKEN_AQUI' })
  @IsString()
  refreshToken: string;
}
