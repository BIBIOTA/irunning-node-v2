import { EVENT_CERTIFICATE } from '../enum/event-certificate.enum';
import { EVENT_STATUS } from '../enum/event-status.enum';
import { EventDistanceDto } from './event-distance.dto';

export class EventOutputDto {
  eventName: string;
  eventInfo: string | null;
  eventLink: string | null;
  eventStatus: EVENT_STATUS;
  eventCertificate: EVENT_CERTIFICATE | null;
  eventDate: string;
  eventTime: string | null;
  location: string | null;
  distances: EventDistanceDto[];
  agent: string | null;
  entryIsEnd: boolean;
  entryStartDate: string | null;
  entryEndDate: string | null;
}
