import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, Matches } from 'class-validator';
import { EVENT_DISTANCES_TYPE } from '../enum/event-distances-type.enum';

export class EventInputDto {
  @ApiProperty({
    required: false,
    description: '模糊查詢賽事名稱(eventName)或賽事地點(location)。',
    type: String,
  })
  @IsOptional()
  keywords?: string;
  @ApiProperty({
    required: false,
    description:
      "查詢特定賽事日期(eventDate)範圍。 ex: ['2020-01-01'] (該日期及該日期以後舉辦的賽事) or ['2020-01-01', '2020-01-02'] (該日期範圍舉辦的賽事)",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @Matches(/^\d{4}(-)(((0)[0-9])|((1)[0-2]))(-)([0-2][0-9]|(3)[0-1])$/i, {
    each: true,
    message: 'date must be formatted as yyyy-mm-dd',
  })
  dateRange?: string[];
  @ApiProperty({
    required: false,
    description:
      "可查詢包含一項或多項特定距離的賽事(array of string)。 - 'MARATHON': 查詢distance >= 42 and < 43 的賽事, 'HALF_MARATHON': 查詢distance > 21 and <= 22的賽事, 'TEN_K': 查詢distance === 10的賽事 (賽事距離單位為km)",
    type: [EVENT_DISTANCES_TYPE],
    enum: EVENT_DISTANCES_TYPE,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(EVENT_DISTANCES_TYPE, { each: true })
  distances?: EVENT_DISTANCES_TYPE[];
}
