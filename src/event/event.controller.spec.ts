import { Test, TestingModule } from '@nestjs/testing';
import { EventOutputDto } from './dto/event.output.dto';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import * as fs from 'fs';
import { join } from 'path';

describe('EventController', () => {
  let controller: EventController;

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

  const html = fs
    .readFileSync(
      join(process.cwd(), './test/mock-files/marathon-org-response.html'),
    )
    .toString();

  const MockEventService = {
    getEvents: jest.fn(() => {
      return Promise.resolve([mockData]);
    }),
    getHtmlSnapshot: jest.fn(() => {
      return Promise.resolve(html);
    }),
    getJsonSnapshot: jest.fn(() => {
      return Promise.resolve([mockData]);
    }),
    updateEvents: jest.fn(() => {
      return Promise.resolve();
    }),
  };

  beforeEach(async () => {
    process.env = { ACCESS_TOKEN: 'test' };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: MockEventService,
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('testGetEvents', async () => {
    const expectResponse = {
      statusCode: 0,
      message: 'ok',
      data: [mockData],
    };
    const response = {
      json: jest.fn().mockResolvedValue(expectResponse),
      status: jest.fn().mockReturnThis(),
    };
    expect(await controller.getEvents(response)).toEqual(expectResponse);
  });

  it('testGetHtmlSnapshot', async () => {
    expect(await controller.getHtmlSnapshot('test')).toEqual(html);
  });

  it('testGetJsonSnapshot', async () => {
    const expectResponse = {
      statusCode: 0,
      message: 'ok',
      data: [mockData],
    };
    const response = {
      json: jest.fn().mockResolvedValue(expectResponse),
      status: jest.fn().mockReturnThis(),
    };
    expect(await controller.getJsonSnapshot('test', response)).toEqual(
      expectResponse,
    );
  });

  it('testUpdateEvents', async () => {
    const expectResponse = {
      statusCode: 0,
      message: 'ok',
      data: null,
    };
    const response = {
      json: jest.fn().mockResolvedValue(expectResponse),
      status: jest.fn().mockReturnThis(),
    };
    expect(await controller.updateEvents('test', response)).toEqual(
      expectResponse,
    );
  });
});
