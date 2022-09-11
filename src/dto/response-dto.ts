import { ApiProperty } from '@nestjs/swagger';
import { ResponseInterface } from 'src/interfaces/response-interface';

export class ResponseDto<T> implements ResponseInterface<T> {
  @ApiProperty()
  status: boolean;
  @ApiProperty()
  data: T;
  @ApiProperty()
  message: string;
}
