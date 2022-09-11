import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from '../../dto/response-dto';
import { EventOutputDto } from './event.output.dto';

export class EventResponseDto extends ResponseDto<[EventOutputDto]> {
  @ApiProperty()
  status: boolean;
  @ApiProperty({ type: [EventOutputDto] })
  data: [EventOutputDto];
  @ApiProperty({ example: 'ok' })
  message: string;
}

export class InternalServerErrorResponseDto {
  @ApiProperty({ example: 500 })
  statusCode: number;
  @ApiProperty({ example: 'Internal Server Error' })
  message: string;
}

export class InvalidTokenResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;
  @ApiProperty({ example: 'Invalid Token' })
  message: string;
}
