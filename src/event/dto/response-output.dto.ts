import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from '../../dto/response-dto';
import { EventOutputDto } from './event.output.dto';

export class EventPaginateDataDto {
  @ApiProperty({ type: [EventOutputDto] })
  events: EventOutputDto[];
  @ApiProperty()
  totalCount: number;
}

export class EventResponseDto extends ResponseDto<EventPaginateDataDto> {
  @ApiProperty()
  statusCode: number;
  @ApiProperty({ type: EventPaginateDataDto })
  data: EventPaginateDataDto;
  @ApiProperty({ example: 'ok' })
  message: string;
}

export class InternalServerErrorResponseDto {
  @ApiProperty({ example: 500 })
  statusCode: number;
  @ApiProperty({ example: 'Internal Server Error' })
  message: string;
}

export class BadRequestResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;
  @ApiProperty({ example: ['date must be formatted as yyyy-mm-dd'] })
  message: string[];
  @ApiProperty({ example: 'Bad Request' })
  error: string;
}

export class InvalidTokenResponseDto {
  @ApiProperty({ example: 401 })
  statusCode: number;
  @ApiProperty({ example: 'Invalid Token' })
  message: string;
}
