import {
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
  Response,
  Headers,
  Query,
} from '@nestjs/common';
import { EventService } from './event.service';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';
import * as _ from 'lodash';
import {
  EventResponseDto,
  InternalServerErrorResponseDto,
  InvalidTokenResponseDto,
} from './dto/response-output.dto';
import { ResponseDto } from '../dto/response-dto';
@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  @Get()
  @ApiOkResponse({
    description: '取得所有賽事',
    type: EventResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerErrorResponseDto,
  })
  async getEvents(@Response() res): Promise<EventResponseDto> {
    const data = await this.eventService.getEvents();
    return res.status(HttpStatus.OK).json({
      statusCode: 0,
      message: 'ok',
      data,
    });
  }

  @Get('/snapshot/html')
  @ApiOkResponse({ description: '查看html快照(僅供開發使用)', type: String })
  @ApiResponse({
    description: 'Bad Request',
    status: 401,
    type: InvalidTokenResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerErrorResponseDto,
  })
  async getHtmlSnapshot(@Query('token') token: string): Promise<any> {
    if (_.includes(process.env.ACCESS_TOKEN, token)) {
      try {
        const data = await this.eventService.getHtmlSnapshot();
        return data;
      } catch (error) {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
  }

  @Get('/snapshot/json')
  @ApiOkResponse({
    description: '取得爬蟲資料(僅供開發使用)',
    type: EventResponseDto,
  })
  @ApiResponse({
    description: 'Bad Request',
    status: 401,
    type: InvalidTokenResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerErrorResponseDto,
  })
  async getJsonSnapshot(
    @Query('token') token: string,
    @Response() res,
  ): Promise<EventResponseDto> {
    if (_.includes(process.env.ACCESS_TOKEN, token)) {
      try {
        const data = await this.eventService.getJsonSnapshot();
        return res.status(HttpStatus.OK).json({
          statusCode: 0,
          message: 'ok',
          data,
        });
      } catch (error) {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
  }

  @Post()
  @ApiOkResponse({
    description: '手動更新賽事資料 (僅供開發使用)',
    type: ResponseDto<null>,
  })
  @ApiResponse({
    description: 'Bad Request',
    status: 401,
    type: InvalidTokenResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
    type: InternalServerErrorResponseDto,
  })
  async updateEvents(
    @Headers('token') token: string,
    @Response() res,
  ): Promise<ResponseDto<null>> {
    if (_.includes(process.env.ACCESS_TOKEN, token)) {
      try {
        await this.eventService.updateEvents();
        return res.status(HttpStatus.OK).json({
          statusCode: 0,
          message: 'ok',
          data: null,
        });
      } catch (error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
  }
}
