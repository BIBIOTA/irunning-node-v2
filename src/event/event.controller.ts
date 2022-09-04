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
import * as _ from 'lodash';
@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  @Get()
  async getEvents(@Response() res) {
    const data = await this.eventService.getEvents();
    return res.status(HttpStatus.OK).json({
      statusCode: 0,
      message: 'ok',
      data,
    });
  }

  @Get('/snapshot/html')
  async getHtmlSnapshot(@Query('token') token: string) {
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
  async getJsonSnapshot(@Query('token') token: string, @Response() res) {
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
  async updateEvents(@Headers('token') token: string, @Response() res) {
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
