import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Response,
} from '@nestjs/common';
import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(private eventService: EventService) {}

  @Get()
  async getEvents(@Response() res) {
    const fetchResult = await this.eventService.getEventsBodyFromOrg();
    if (fetchResult.status === HttpStatus.OK) {
      try {
        const data = this.eventService.crawlerEvents(fetchResult.data);
        return res.status(HttpStatus.OK).json({
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
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
}
