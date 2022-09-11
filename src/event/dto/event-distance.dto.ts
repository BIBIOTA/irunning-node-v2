import { ApiProperty } from '@nestjs/swagger';

export class EventDistanceDto {
  @ApiProperty({ description: '距離(km)', example: 42.195, nullable: true })
  distance: number | null;
  @ApiProperty({
    description: '綜合賽事距離(ex.三鐵)',
    example: '1.5K+40K+10K',
    nullable: true,
  })
  complexDistance: string | null;
  @ApiProperty({
    description: '報名費用',
    example: 1000,
    nullable: true,
  })
  eventPrice: number | null;
  @ApiProperty({
    description: '參賽人數限制',
    example: 1000,
    nullable: true,
  })
  eventLimit: number | null;
}
