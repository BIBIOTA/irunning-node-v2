import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as moment from 'moment';
import { EventOutputDto } from './dto/event.output.dto';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class EventService {
  constructor(private readonly httpService: HttpService) {}

  getEventsBodyFromOrg(): Promise<AxiosResponse> {
    return this.httpService.axiosRef.get(
      'http://www.taipeimarathon.org.tw/contest.aspx',
    );
  }

  crawlerEvents(body: string): EventOutputDto[] {
    const result = [];
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

  private transformEvent(td: cheerio.Cheerio, year: string): EventOutputDto {
    const title = this.getTitle(td);
    const [date, time] = this.getDateTime(td);
    const entry = this.getEntry(td);
    const [entryStartDate, endtryEndDate] = this.getEntryStartAndEnd(
      year,
      entry,
    );
    const event = {
      eventName: this.getEventName(title),
      eventInfo: this.getEventInfo(title),
      eventLink: this.getLink(td),
      eventStatus: this.getEventStatus(td),
      eventCertificate: this.getEventCertificate(td),
      eventDate: this.getDate(year, date),
      eventTime: this.getEventTime(time),
      location: this.getLocation(td),
      distances: this.getDistances(td),
      agent: this.getAgent(td),
      participate: this.getPaticipate(entryStartDate, endtryEndDate),
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
      return moment(time, 'HH:mm').format('HH:mm:ss');
    }

    return null;
  }

  private getEventStatus(td: cheerio.Cheerio): boolean {
    return td.eq(1).css('text-decoration') === 'line-through' ? false : true;
  }

  private getEventCertificate(td: cheerio.Cheerio): number | null {
    const certificate = td.eq(2).find('img').attr('src');
    let eventCertificate;
    switch (certificate) {
      case '/images/iaaf.gif':
        eventCertificate = 1;
        break;
      case '/images/aims_logo.gif':
        eventCertificate = 2;
        break;
      case '/images/course_ok.png':
        eventCertificate = 3;
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
    return td.eq(4).text() ?? null;
  }

  private getDistances(td: cheerio.Cheerio): Array<object> {
    const distancesElement = td.eq(5).find('button');
    const distances = [];
    if (distancesElement.length > 0) {
      for (let i = 0; i <= distancesElement.length - 1; i++) {
        const data = distancesElement.eq(i).html();
        let distance = null;
        let eventDistance = null;
        if (
          !data.includes('+') &&
          data.includes('K') &&
          !isNaN(parseFloat(data.replace('K', '')))
        ) {
          distance = parseFloat(data.replace('K', ''));
        } else {
          eventDistance = data;
        }
        const distanceInfo = distancesElement.eq(i).attr('title').split('：');
        const eventPrice =
          parseInt(distanceInfo[1].split('<br/>')[0].trim()) ?? null;
        const eventLimit = parseInt(distanceInfo[2]) ?? null;
        distances.push({
          distance,
          eventDistance,
          eventPrice: eventPrice,
          eventLimit: eventLimit,
        });
      }
    }

    return distances;
  }

  private getAgent(td: cheerio.Cheerio): string {
    return td.eq(6).text();
  }

  private getPaticipate(entryStart: string, endtryEnd: string): string | null {
    if (entryStart && endtryEnd) {
      const start = entryStart ? moment(entryStart).format('M/DD') : '';
      const end = endtryEnd ? moment(endtryEnd).format('M/DD') : '';
      let entryLastDayCount = null;
      if (end) {
        entryLastDayCount =
          moment(endtryEnd).diff(moment(Date.now()), 'days') + 1;
      }
      let lastDayStr = '';
      if (entryLastDayCount !== null && entryLastDayCount <= 7) {
        lastDayStr = ` (最後${entryLastDayCount}天)`;
      }
      return start + '~' + end + lastDayStr;
    }
    return null;
  }

  private getEntry(td: cheerio.Cheerio): string {
    return td.eq(7).text().trim().replace(/\s/g, '');
  }

  private getEntryStartAndEnd(
    year: string,
    entry: string | null,
  ): Array<string> | null {
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
      }
      if (entryStart > entryEnd) {
        entryEnd = moment(entryEnd).add(1, 'years').format('YYYY-MM-DD');
      }
      return [entryStart, entryEnd];
    }
    return null;
  }

  private formatChineseDateToDate(year: string, dateFormat: string): string {
    const date = moment(
      dateFormat.match(/^(0?[1-9]|1[0-2])[月](0?[1-9]|[12]\d|30|31)[日]/gi)[0],
      'M月DD日',
      'en',
      true,
    ).format('MM-DD');
    return year + '-' + date;
  }

  private checkEntryIsEnd(entry: string | null): boolean {
    if (entry === '已截止') {
      return true;
    }
    return false;
  }

  private getEventName(title: string): string {
    const brackets = this.getBrackets(title);
    return title.substring(0, title.indexOf(brackets.first));
  }

  private getEventInfo(title: string): string {
    const brackets = this.getBrackets(title);

    return title.substring(
      title.indexOf(brackets.first) + 1,
      title.indexOf(brackets.last),
    );
  }

  private getDate(year: string, date: string) {
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
}
