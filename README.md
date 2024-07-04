### [🏃🏻 TW-MARATHON-API](https://marathontw.bibiota.com/events)

![@nestjs/cli](https://img.shields.io/badge/%40nestjs%2Fcli-%5E9.1.2-blue)
![typescript](https://img.shields.io/badge/typescript-%5E4.8.3-blue)
![cheerio](https://img.shields.io/badge/cheerio-1.0.0--rc.12-blue)
![mongoose](https://img.shields.io/badge/mongoose-%5E6.6.0-blue)

#### About this repository:

這是一個愛跑步的工程師所做的Side Project，透過爬蟲取得[跑者廣場-全國賽會](http://www.taipeimarathon.org.tw/contest.aspx)的資料，整理過後完成了能夠查詢特定條件賽事的API。
  - API文件請參考[Swagger Docs](https://marathontw.bibiota.com/api)
  - 前端頁面可前往[marathontw-web.bibiota.com](https://marathontw-web.bibiota.com/)
  - 資料取得方式: cronjob(每日03:00及15:00)，或透過API手動更新(僅供開發者)。
  - 僅供學術研究用途使用。

#### Next tasks

- Line Notify 服務 (目前有串接個人Slack Channel，每週一早上09:00會推播前一週新增的賽事、一週內可開始報名的賽事、即將截止報名新增的賽事。)

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
- 如果對這個專案有興趣，或只是想和作者練跑(Taipei-keelung only)，歡迎留言^^

### Code owner
[@BiBiOTA](https://blog.bibiota.com/)

### License

[MIT licensed](LICENSE).
