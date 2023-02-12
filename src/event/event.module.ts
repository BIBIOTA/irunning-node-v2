import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './event.controller';
import { Event, EventSchema } from './event.model';
import { EventService } from './event.service';
import { SlackModule } from 'nestjs-slack';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot(),
    SlackModule.forRoot({
      type: 'webhook',
      url: process.env.SLACL_WEBHOOK_URL,
    }),
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
