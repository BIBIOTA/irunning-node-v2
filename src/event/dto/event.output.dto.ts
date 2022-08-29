export class EventOutputDto {
  eventName: string;
  eventInfo: string;
  eventLink: string | null;
  eventStatus: boolean;
  eventCertificate: number | null;
  eventDate: string;
  eventTime: string | null;
  location: string | null;
  distances: object;
  agent: string | null;
  participate: string;
  entryIsEnd: boolean;
  entryStartDate: string | null;
  entryEndDate: string | null;
}
