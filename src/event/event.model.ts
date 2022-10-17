import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EVENT_CERTIFICATE } from './enum/event-certificate.enum';
import { EVENT_STATUS } from './enum/event-status.enum';
import { EventDistanceDto } from './dto/event-distance.dto';

@Schema()
export class Event {
  _id: MongooseSchema.Types.ObjectId;

  @Prop()
  eventName: string;

  @Prop()
  eventInfo: string | null;

  @Prop()
  eventLink: string | null;

  @Prop()
  eventStatus: EVENT_STATUS;

  @Prop()
  eventCertificate: EVENT_CERTIFICATE | null;

  @Prop()
  eventDate: string;

  @Prop()
  eventTime: string | null;

  @Prop()
  location: string | null;

  @Prop()
  distances: EventDistanceDto[];

  @Prop()
  agent: string | null;

  @Prop()
  entryIsEnd: boolean;

  @Prop()
  entryStartDate: string | null;

  @Prop()
  entryEndDate: string | null;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({ default: null })
  updatedAt?: Date;
}

export type EventDocument = Event & Document;

export const EventSchema = SchemaFactory.createForClass(Event);
