import { ApiProperty } from '@nestjs/swagger';
import { EVENT_CERTIFICATE } from '../enum/event-certificate.enum';
import { EVENT_STATUS } from '../enum/event-status.enum';
import { EventDistanceDto } from './event-distance.dto';

export class EventOutputDto {
  @ApiProperty({ description: '賽事名稱', example: '田中馬拉松' })
  eventName: string;
  @ApiProperty({
    description: '賽事資訊',
    example: '延期至2100年',
    nullable: true,
  })
  eventInfo: string | null;
  @ApiProperty({
    description: '賽事官網連結',
    example: 'https://tw-marathons.bibiota.com/events',
    nullable: true,
  })
  eventLink: string | null;
  @ApiProperty({
    example: 0,
    description: '活動狀態 - 0:延期或取消, 1: 正常舉行',
  })
  eventStatus: EVENT_STATUS;
  @ApiProperty({
    example: 1,
    description:
      '賽事證書 - 1: IAAF認證賽事, 2: AIMS認證賽事, 3: 賽事路線經IAAF/AIMS測量員丈量',
    nullable: true,
  })
  eventCertificate: EVENT_CERTIFICATE | null;
  @ApiProperty({
    description: '舉辦日期',
    example: '2020-01-01',
  })
  eventDate: string;
  @ApiProperty({
    description: '起跑時間',
    example: '08:00',
    nullable: true,
  })
  eventTime: string | null;
  @ApiProperty({
    description: '舉辦地點',
    example: '彰化縣立景崧文化教育園區',
  })
  location: string | null;
  @ApiProperty({
    description: '賽事距離',
    type: [EventDistanceDto],
  })
  distances: EventDistanceDto[];
  @ApiProperty({
    description: '主辦單位',
    example: '彰化縣政府',
    nullable: true,
  })
  agent: string | null;
  @ApiProperty({
    description: '是否結束報名',
    example: true,
  })
  entryIsEnd: boolean;
  @ApiProperty({
    description: '報名開始日期',
    example: '2020-01-01',
    nullable: true,
  })
  entryStartDate: string | null;
  @ApiProperty({
    description: '報名結束日期',
    example: '2020-01-01',
    nullable: true,
  })
  entryEndDate: string | null;
}
