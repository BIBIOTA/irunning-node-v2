### [🏃🏻 TW-MARATHON-API](https://marathontw.bibiota.com/events)

![@nestjs/cli](https://img.shields.io/badge/%40nestjs%2Fcli-%5E9.1.2-blue)
![typescript](https://img.shields.io/badge/typescript-%5E4.8.3-blue)
![cheerio](https://img.shields.io/badge/cheerio-1.0.0--rc.12-blue)
![mongoose](https://img.shields.io/badge/mongoose-%5E6.6.0-blue)

#### About this repository:

這是一個由一個喜歡跑步的後端工程師在閒暇時間開發，想要將網路上的台灣路跑資訊整理後供大家使用的專案。
目前透過爬蟲取得[跑者廣場-全國賽會](http://www.taipeimarathon.org.tw/contest.aspx)的資料，整理成OPEN API提供給大家。

  - API文件請參考[Swagger Docs](https://marathontw.bibiota.com/api)
  - 資料取得方式: cronjob(每日03:00及15:00)，或透過API手動更新(僅供開發者使用)。
  - 目前尚在實驗階段，僅供學術研究用途使用，請勿直接使用在商業環境 ！

#### Next tasks

- 搜尋功能(陸續增加中)
- 個人化通知(Telegram)
- 前端畫面

#### Requires

- node.js (LTS)
- mongodb (>=4.2)

#### How to install this service on local?

1. Install dependency packages.
```
npm install -g pnpm
pnpm install
```

2. Setting environment variable.
```
cp env.example .env
```

3. run dev
```
pnpm start:dev
```

#### How to contribute code ?
- 如有資料上的建議或錯誤，可在[Issue](https://github.com/BIBIOTA/tw-marathon-api/issues)提供資訊，作者會在下班時間有空的時候進行修正。
- 如果對這個專案有興趣，或只是想和作者練跑(Taipei-keelung only)，歡迎留言給我^^

### Code owner
[@BiBiOTA Telegram](https://t.me/BiBiOTA)

### License

[MIT licensed](LICENSE).
