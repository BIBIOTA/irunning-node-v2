import * as cheerio from 'cheerio';
import * as moment from 'moment';
import * as _ from 'lodash';
import { EventOutputDto } from './dto/event.output.dto';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { EVENT_STATUS } from './enum/event-status.enum';
import { EVENT_CERTIFICATE } from './enum/event-certificate.enum';
import { EventDistanceDto } from './dto/event-distance.dto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from './event.model';
import { EVENT_MESSEAGE } from './enum/error-message.enum';
import { EventInputDto } from './dto/event.input.dto';
import { EVENT_DISTANCES_TYPE } from './enum/event-distances-type.enum';
import { SlackService } from 'nestjs-slack';
@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private readonly httpService: HttpService,
    // TODO: Add logService
    private slackService: SlackService,
  ) {}

  getEventsBodyFromOrg(): Promise<AxiosResponse> {
    return this.httpService.axiosRef.get(
      'http://www.taipeimarathon.org.tw/contest.aspx',
    );
  }

  crawlerEvents(body: string): EventOutputDto[] {
    const result: EventOutputDto[] = [];
    const $ = cheerio.load(body);
    const tr = $('table.gridview tr');

    let lastRecordMonthIndex;
    let year = moment().format('YYYY');

    for (let i = 1; i < tr.length; i++) {
      const td = tr.eq(i).find('td');

      const month = this.getMonth(td);
      if (month) {
        const monthIndex = this.getMonthIndex(month);
        year = this.getYear(year, monthIndex, lastRecordMonthIndex);
        lastRecordMonthIndex = monthIndex;
      }

      result.push(this.transformEvent(td, year));
    }

    return result;
  }

  async getEvent(
    eventName: string,
    eventDate: string,
  ): Promise<EventOutputDto | null> {
    const event = await this.eventModel
      .findOne({ eventName, eventDate })
      .select(['-_id', '-__v', '-createdAt', '-updatedAt'])
      .exec();
    if (!event) {
      return null;
    }
    return event;
  }

  async getEvents(eventInputDto: EventInputDto): Promise<EventOutputDto[]> {
    const searchQuery = this.setSearchQuery(eventInputDto);

    const model = this.eventModel
      .find(searchQuery)
      .select(['-_id', '-__v'])
      .sort({
        [eventInputDto.sortBy]: eventInputDto.orderBy === 'asc' ? 1 : -1,
      });

    const { offset, limit } = eventInputDto;

    if (offset && limit) {
      model.skip(offset).limit(limit);
    }

    return await model.exec();
  }

  async getEventsCount(eventInputDto: EventInputDto): Promise<number> {
    const searchQuery = this.setSearchQuery(eventInputDto);
    return await this.eventModel
      .find(searchQuery)
      .select(['-_id', '-__v'])
      .sort({ eventDate: 1 })
      .count()
      .exec();
  }

  @Cron('0 3,15 * * *', {
    name: 'update events',
    timeZone: 'Asia/Taipei',
  })
  async updateEvents(): Promise<void> {
    const fetchResult = await this.getEventsBodyFromOrg();
    if (fetchResult.status === HttpStatus.OK) {
      try {
        let updatedCount = 0;
        let insertCount = 0;
        const eventOutputDtos = this.crawlerEvents(fetchResult.data);
        eventOutputDtos.map(async (event) => {
          const data = await this.getEvent(event.eventName, event.eventDate);
          if (data) {
            await this.eventModel
              .findOne({
                eventName: event.eventName,
                eventDate: event.eventDate,
              })
              .updateOne({ ...event, updatedAt: new Date() });
            updatedCount++;
            return;
          }
          new this.eventModel({ ...event, createdAt: new Date() }).save();
          insertCount++;
        });
        const removeOutDatedCount = await this.removeOutDatedEvents();
        const removeNotFoundCount = await this.removeNotFoundEvents(
          eventOutputDtos,
        );
        this.sendToSlack(
          EVENT_MESSEAGE.SUCCESS_UPDATE_EVENT +
            '. ' +
            this.getCountMessege(
              updatedCount,
              insertCount,
              removeOutDatedCount,
              removeNotFoundCount,
            ),
        );
        return;
      } catch (error) {
        this.sendToSlack(EVENT_MESSEAGE.ERROR_UPDATE_EVENT, error);
      }
    }
    this.sendToSlack(EVENT_MESSEAGE.ERROR_UPDATE_EVENT);
    throw EVENT_MESSEAGE.ERROR_UPDATE_EVENT_API_REQUEST;
  }

  async removeOutDatedEvents(): Promise<number> {
    const result = await this.eventModel
      .deleteMany({
        eventDate: {
          $lt: moment().format('YYYY-MM-DD'),
        },
      })
      .exec();
    return result.deletedCount;
  }

  async removeNotFoundEvents(
    eventOutputDtos: EventOutputDto[],
  ): Promise<number> {
    let removeCount = 0;
    const events = await this.getEvents(new EventInputDto());
    events.map((event) => {
      const isExist = eventOutputDtos.find(
        (eventOutputDto) =>
          eventOutputDto.eventName === event.eventName &&
          eventOutputDto.eventDate === event.eventDate,
      );
      if (!isExist) {
        this.eventModel
          .findOne({
            eventName: event.eventName,
            eventDate: event.eventDate,
          })
          .deleteOne()
          .exec();
        removeCount++;
      }
    });
    return removeCount;
  }

  async getHtmlSnapshot(): Promise<any> {
    const fetchResult = await this.getEventsBodyFromOrg();
    if (fetchResult.status === HttpStatus.OK) {
      const $ = cheerio.load(fetchResult.data);
      return $('*').html();
    }
    throw this.logger.error('Error when get events. API Request Error');
  }

  async getJsonSnapshot(): Promise<any> {
    const fetchResult = await this.getEventsBodyFromOrg();
    if (fetchResult.status === HttpStatus.OK) {
      return this.crawlerEvents(fetchResult.data);
    }
    throw this.logger.error('Error when get events. API Request Error');
  }

  @Cron('0 9 * * 1', {
    name: 'send events message',
    timeZone: 'Asia/Taipei',
  })
  async sendEventsMessage(): Promise<void> {
    let dto = new EventInputDto();
    dto.createdAtTimes = [
      moment().subtract(1, 'weeks').format('YYYY/MM/DD HH:mm:ss'),
      moment().format('YYYY/MM/DD HH:mm:ss'),
    ];
    this.sendEventMessage(dto, '本週新增賽事： \n');

    dto = new EventInputDto();
    dto.entryStartDates = [
      moment().format('YYYY-MM-DD'),
      moment().add(1, 'weeks').format('YYYY-MM-DD'),
    ];
    dto.sortBy = 'entryStartDate';
    dto.orderBy = 'asc';
    this.sendEventMessage(dto, '本週開報賽事： \n');

    dto = new EventInputDto();
    dto.entryEndDates = [
      moment().format('YYYY-MM-DD'),
      moment().add(1, 'weeks').format('YYYY-MM-DD'),
    ];
    dto.sortBy = 'entryEndDate';
    dto.orderBy = 'asc';
    this.sendEventMessage(dto, '本週截止報名賽事： \n');
  }

  private async sendEventMessage(
    eventInputDto: EventInputDto,
    title: string,
  ): Promise<void> {
    const newEvents = await this.getEvents(eventInputDto);
    const message = this.formatSlackEventsMessage(title, newEvents);
    this.sendToSlack(message, false);
  }

  private sendToSlack(message: string, addTime = true): void {
    message = addTime
      ? message + '\n' + moment().format('YYYY-MM-DD HH:mm:ss')
      : message;
    this.slackService.sendText(message);
  }

  private setSearchQuery(eventInputDto: EventInputDto): object {
    const {
      keywords,
      dateRange,
      distances,
      entryIsEnd,
      onlyRegistering,
      createdAtTimes,
      entryStartDates,
    } = eventInputDto;
    let searchQuery = {};
    searchQuery = this.setKeywordsQuery(searchQuery, keywords);
    searchQuery = this.setEventDateRangeQuery(searchQuery, dateRange);
    searchQuery = this.setDistancesQuery(searchQuery, distances);
    searchQuery = this.setEntryIsEndQuery(searchQuery, entryIsEnd);
    searchQuery = this.setOnlyRegisteringQuery(searchQuery, onlyRegistering);
    searchQuery = this.setCreatedAtQuery(searchQuery, createdAtTimes);
    searchQuery = this.setEntryStartDatesQuery(searchQuery, entryStartDates);
    searchQuery = this.setEntryEndDatesQuery(searchQuery, eventInputDto);
    return searchQuery;
  }

  private setKeywordsQuery(
    searchQuery: object,
    keywords: string | null,
  ): object {
    if (keywords) {
      _.set(searchQuery, '$or', [
        {
          eventName: { $regex: '.*' + keywords + '.*' },
        },
        {
          location: { $regex: '.*' + keywords + '.*' },
        },
      ]);
    }

    return searchQuery;
  }

  private setEventDateRangeQuery(
    searchQuery: object,
    dateRange: string[] | null,
  ): object {
    if (dateRange && dateRange.length > 0) {
      const [startDate, endDate] = dateRange;
      _.set(searchQuery, 'eventDate', {
        $gte: startDate,
      });
      if (endDate) {
        _.set(searchQuery, 'eventDate.$lte', endDate);
      }
    } else {
      _.set(searchQuery, 'eventDate', {
        $gte: moment().format('YYYY-MM-DD'),
      });
    }

    return searchQuery;
  }

  private setDistancesQuery(
    searchQuery: object,
    distances: EVENT_DISTANCES_TYPE[] | null,
  ): object {
    if (distances && distances.length > 0) {
      const distancesQuery = [];
      distances.forEach((distance: EVENT_DISTANCES_TYPE) => {
        let query = {};
        if (distance === EVENT_DISTANCES_TYPE.MARATHON) {
          query = { $gte: 42, $lt: 43 };
        }
        if (distance === EVENT_DISTANCES_TYPE.HALF_MARATHON) {
          query = { $gte: 21, $lt: 22 };
        }
        if (distance === EVENT_DISTANCES_TYPE.TEN_K) {
          query = 10;
        }
        distancesQuery.push({
          distances: {
            $elemMatch: {
              distance: query,
            },
          },
        });
      });
      _.set(searchQuery, '$and', distancesQuery);
    }
    return searchQuery;
  }

  private setEntryIsEndQuery(searchQuery: object, entryIsEnd: boolean | null) {
    if (entryIsEnd === true) {
      _.set(searchQuery, 'entryIsEnd', true);
    }
    if (entryIsEnd === false) {
      _.set(searchQuery, 'entryIsEnd', false);
    }
    return searchQuery;
  }

  private setOnlyRegisteringQuery(
    searchQuery: object,
    onlyRegistering: boolean | null,
  ) {
    const today = moment().format('YYYY-MM-DD');
    if (onlyRegistering === true) {
      _.set(searchQuery, 'entryStartDate', {
        $lte: today,
      });
      _.set(searchQuery, 'entryEndDate', {
        $gte: today,
      });
    }
    return searchQuery;
  }

  private setCreatedAtQuery(
    searchQuery: object,
    createdAtTimes: string[] | null,
  ) {
    if (!createdAtTimes || createdAtTimes.length !== 2) {
      return searchQuery;
    }
    const [createdAtStart, createdAtEnd] = createdAtTimes;
    _.set(searchQuery, 'createdAt', {
      $gte: new Date(createdAtStart),
      $lte: new Date(createdAtEnd),
    });
    return searchQuery;
  }

  private setEntryStartDatesQuery(
    searchQuery: object,
    eventStartDates: string[] | null,
  ) {
    if (!eventStartDates || eventStartDates.length > 2) {
      return searchQuery;
    }
    const [startDate, endDate] = eventStartDates;
    _.set(searchQuery, 'entryStartDate', {
      $gte: startDate,
    });
    if (endDate) {
      _.set(searchQuery, 'entryStartDate.$lte', endDate);
    }
    return searchQuery;
  }

  private setEntryEndDatesQuery(
    searchQuery: object,
    eventInputDto: EventInputDto,
  ) {
    const { entryEndDates } = eventInputDto;
    if (!entryEndDates || entryEndDates.length > 2) {
      return searchQuery;
    }
    const [startDate, endDate] = entryEndDates;
    _.set(searchQuery, 'entryEndDate', {
      $gte: startDate,
    });
    if (endDate) {
      _.set(searchQuery, 'entryEndDate.$lte', endDate);
    }
    return searchQuery;
  }

  private transformEvent(td: cheerio.Cheerio, year: string): EventOutputDto {
    const title = this.getTitle(td);
    const [date, time] = this.getDateTime(td);
    const eventDate = this.getDate(year, date);
    const entry = this.getEntry(td);
    const [entryStartDate, endtryEndDate] = this.getEntryStartAndEnd(
      year,
      eventDate,
      entry,
    );
    const event = {
      eventName: this.getEventName(title),
      eventInfo: this.getEventInfo(title),
      eventLink: this.getLink(td),
      eventStatus: this.getEventStatus(td),
      eventCertificate: this.getEventCertificate(td),
      eventDate: eventDate,
      eventTime: this.getEventTime(time),
      location: this.getLocation(td),
      distances: this.getDistances(td),
      agent: this.getAgent(td),
      entryIsEnd: this.checkEntryIsEnd(entry),
      entryStartDate: entryStartDate,
      entryEndDate: endtryEndDate,
    };

    return event;
  }

  private getTitle(td: cheerio.Cheerio): string {
    return td.eq(1).find('a').text()
      ? td.eq(1).find('a').text().trim()
      : td.eq(1).text().trim();
  }

  private getLink(td: cheerio.Cheerio): string | null {
    return td.eq(1).find('a').text() ? td.eq(1).find('a').attr('href') : null;
  }

  private getDateTime(td: cheerio.Cheerio): Array<string> {
    const [date, , time] = td.eq(3).text().trim().split(' ');
    return [date, time];
  }

  private getEventTime(time: string | null): string | null {
    if (time) {
      return time;
    }

    return null;
  }

  private getEventStatus(td: cheerio.Cheerio): EVENT_STATUS {
    return td.eq(1).css('text-decoration') === 'line-through'
      ? EVENT_STATUS.CANCELED_OR_POSTPONE
      : EVENT_STATUS.NORMAL;
  }

  private getEventCertificate(td: cheerio.Cheerio): EVENT_CERTIFICATE | null {
    const certificate = td.eq(2).find('img').attr('src');
    let eventCertificate: EVENT_CERTIFICATE | null;
    switch (certificate) {
      case '/images/iaaf.gif':
        eventCertificate = EVENT_CERTIFICATE.IAAF;
        break;
      case '/images/aims_logo.gif':
        eventCertificate = EVENT_CERTIFICATE.AIMS;
        break;
      case '/images/course_ok.png':
        eventCertificate = EVENT_CERTIFICATE.COURSE_CACULATED;
        break;
      default:
        eventCertificate = null;
    }
    return eventCertificate;
  }

  private getYear(
    year: string,
    monthIndex: number,
    lastRecordMonthIndex: number | undefined,
  ): string {
    if (lastRecordMonthIndex > monthIndex) {
      return moment(year).add(1, 'years').format('YYYY');
    }
    return year;
  }

  private getMonth(td: cheerio.Cheerio): string | null {
    return td.eq(0).find('span').text() ?? null;
  }
  private getLocation(td: cheerio.Cheerio): string | null {
    const location = td.eq(4).text().trim();
    return location != '' ? location : null;
  }

  private getDistances(td: cheerio.Cheerio): EventDistanceDto[] {
    const distancesElement = td.eq(5).find('button');
    const distances: EventDistanceDto[] = [];
    if (distancesElement.length > 0) {
      for (let i = 0; i <= distancesElement.length - 1; i++) {
        const data = distancesElement.eq(i).html();
        let distance = null;
        let complexDistance = null;
        if (
          !data.includes('+') &&
          data.includes('K') &&
          !isNaN(parseFloat(data.replace('K', '')))
        ) {
          distance = parseFloat(data.replace('K', ''));
        } else {
          complexDistance = data;
        }
        const distanceInfo = distancesElement.eq(i).attr('title').split('：');
        const eventPrice = parseInt(distanceInfo[1].split('<br/>')[0].trim());
        const eventLimit = parseInt(distanceInfo[2]);
        distances.push({
          distance,
          complexDistance,
          eventPrice: isNaN(eventPrice) ? null : eventPrice,
          eventLimit: isNaN(eventLimit) ? null : eventLimit,
        });
      }
    }

    return distances;
  }

  private getAgent(td: cheerio.Cheerio): string | null {
    const agent = td.eq(6).text().trim();
    return agent != '' ? agent : null;
  }

  private getEntry(td: cheerio.Cheerio): string {
    return td.eq(7).text().trim().replace(/\s/g, '');
  }

  private getEntryStartAndEnd(
    year: string,
    date: string,
    entry: string | null,
  ): Array<string | null> {
    if (entry === '已截止') {
      return [null, null];
    }

    if (entry !== null) {
      let entryStart = null;
      let entryEnd = null;
      const [start, end] = entry.split('~');
      if (start) {
        entryStart = this.formatChineseDateToDate(year, start);
      }
      if (end) {
        entryEnd = this.formatChineseDateToDate(year, end);
        if (entryStart && entryStart > entryEnd) {
          entryEnd = moment(entryEnd).add(1, 'years').format('YYYY-MM-DD');
        }
      }
      if (date < entryStart) {
        entryStart = moment(entryStart)
          .subtract(1, 'years')
          .format('YYYY-MM-DD');
      }
      if (date < entryEnd) {
        entryEnd = moment(entryEnd).subtract(1, 'years').format('YYYY-MM-DD');
      }
      return [entryStart, entryEnd];
    }
    return null;
  }

  private formatChineseDateToDate(year: string, dateFormat: string): string {
    const date = moment(
      year +
        '年' +
        dateFormat.match(
          /^(0?[1-9]|1[0-2])[月](0?[1-9]|[12]\d|28|29|30|31)[日]/gi,
        )[0],
      'YYYY年M月DD日',
      'en',
      true,
    ).format('YYYY-MM-DD');
    return date;
  }

  private checkEntryIsEnd(entry: string | null): boolean {
    if (entry === '已截止') {
      return true;
    }
    return false;
  }

  private getEventName(title: string): string {
    const { first, last } = this.getBrackets(title);
    if (first === null && last === null) {
      return title;
    }
    return title.substring(0, title.indexOf(first));
  }

  private getEventInfo(title: string): string | null {
    const { first, last } = this.getBrackets(title);

    if (first === null && last === null) {
      return null;
    }

    return title.substring(title.indexOf(first) + 1, title.indexOf(last));
  }

  private getDate(year: string, date: string): string {
    return moment(new Date(`${year}/${date}`)).format('YYYY-MM-DD');
  }

  private getBrackets(title: string): any {
    const brackets = {
      first: null,
      last: null,
    };
    if (title.includes('（')) {
      brackets.first = '（';
    } else if (title.includes('(')) {
      brackets.first = '(';
    }

    if (title.includes('）')) {
      brackets.last = '）';
    } else if (title.includes(')')) {
      brackets.last = ')';
    }

    return brackets;
  }

  private getMonthIndex(month: string): number {
    const monthArr = [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ];
    let index;
    monthArr.forEach((m, i) => {
      if (m === month) {
        index = i;
      }
    });
    return index;
  }

  private getCountMessege(
    updatedCount: number,
    insertCount: number,
    removeOutDatedCount: number,
    removeNotFoundCount: number,
  ): string {
    return `Updated: ${updatedCount} Insert: ${insertCount} RemoveOutDated: ${removeOutDatedCount} RemoveNotFound: ${removeNotFoundCount}`;
  }

  private formatSlackEventsMessage(
    message: string,
    eventOutputDtos: EventOutputDto[],
  ): string {
    eventOutputDtos.forEach((event) => {
      message += `${event.eventName} \n    活動日期: ${event.eventDate}\n`;
      if (event.entryStartDate) {
        message += `    報名開始日期: ${event.entryStartDate} \n`;
      }
      if (event.entryEndDate) {
        message += `    報名截止日期: ${event.entryEndDate} \n`;
      }

      if (event.eventLink) {
        message += `    報名網址: ${event.eventLink}`;
      }
      message += '\n';
    });
    return message;
  }
}
