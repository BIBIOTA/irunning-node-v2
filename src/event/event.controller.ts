import {
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
  Response,
  Headers,
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

  @Post()
  async updateEvents(@Headers('token') token: string, @Response() res) {
    if (_.includes(process.env.ACCESS_TOKEN, token)) {
      try {
        const data = await this.eventService.updateEvents();
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
}
