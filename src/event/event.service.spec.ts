import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { getModelToken } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Event } from './event.model';
import * as fs from 'fs';
import { join } from 'path';
import { EventOutputDto } from './dto/event.output.dto';
import { response } from 'src/interfaces/response-interface';

describe('EventService', () => {
  let service: EventService;
  const html = fs
    .readFileSync(
      join(process.cwd(), './test/mock-files/marathon-org-response.html'),
    )
    .toString();

  const expectResponse = fs
    .readFileSync(
      join(process.cwd(), './test/mock-files/expect-events-result.json'),
    )
    .toString();
  const mockJsonResponse: response<EventOutputDto[]> =
    JSON.parse(expectResponse);

  const mockData = {
    eventName: '2022 臺灣米倉田中馬拉松',
    eventInfo: null,
    eventLink: 'https://irunner.biji.co/Tianzhong2022/signu',
    eventStatus: 1,
    eventCertificate: 2,
    eventDate: '2022-11-13',
    eventTime: '06:20',
    location: '彰化縣田中鎮景崧文化教育園區',
    distances: [
      {
        distance: 42.195,
        complexDistance: null,
        eventPrice: 1400,
        eventLimit: 4000,
      },
      {
        distance: 22.6,
        complexDistance: null,
        eventPrice: 1200,
        eventLimit: 6000,
      },
      {
        distance: 9.7,
        complexDistance: null,
        eventPrice: 1000,
        eventLimit: 6500,
      },
    ],
    agent: '彰化縣政府/舒康運動協會',
    entryIsEnd: true,
    entryStartDate: null,
    entryEndDate: null,
  } as EventOutputDto;

  class MockEventModel {
    constructor(private data) {}
    save = jest.fn().mockResolvedValue(this.data);
    static find = jest.fn().mockImplementation(() => {
      return {
        select: jest.fn().mockImplementation(() => {
          return {
            exec: jest.fn().mockResolvedValue([mockData]),
          };
        }),
      };
    });
    static findOne = jest.fn().mockResolvedValue(mockData);
    static findOneAndUpdate = jest.fn().mockResolvedValue(mockData);
    static deleteOne = jest.fn().mockResolvedValue(true);
    static deleteMany = jest.fn().mockImplementation(() => {
      return {
        exec: jest.fn().mockResolvedValue(true),
      };
    });
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: HttpService,
          useValue: {
            axiosRef: {
              get: jest.fn(() => {
                return Promise.resolve({
                  status: 200,
                  data: html,
                });
              }),
            },
          },
        },
        {
          provide: getModelToken(Event.name),
          useValue: MockEventModel,
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('testGetEventBodyFromOrg', async () => {
    expect(await service.getEventsBodyFromOrg()).toEqual({
      status: 200,
      data: html,
    });
  });

  it('testCrawlerEvents', async () => {
    const result = service.crawlerEvents(html);
    const expectResult: EventOutputDto[] = mockJsonResponse.data;
    expect(result).toEqual(expectResult);
  });

  it('testGetEvents', async () => {
    expect(await service.getEvents()).toEqual([mockData]);
  });

  it('testUpdateEvents', async () => {
    jest.spyOn(service, 'getEventsBodyFromOrg').mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        data: html,
      }) as any;
    });
    jest.spyOn(service, 'crawlerEvents').mockImplementation(() => {
      return [mockData];
    });
    expect(await service.updateEvents()).toBeUndefined();
  });

  it('testGetHtmlSnapshot', async () => {
    jest.spyOn(service, 'getEventsBodyFromOrg').mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        data: html,
      }) as any;
    });
    expect(typeof (await service.getHtmlSnapshot())).toBe('string');
  });

  it('testJsonSnapshot', async () => {
    jest.spyOn(service, 'getEventsBodyFromOrg').mockImplementation(() => {
      return Promise.resolve({
        status: 200,
        data: html,
      }) as any;
    });
    jest.spyOn(service, 'crawlerEvents').mockImplementation(() => {
      return [mockData];
    });
    expect(await service.getJsonSnapshot()).toEqual([mockData]);
  });
});
