### 🏃🏻 TW-MARATHON-API

![@nestjs/cli](https://img.shields.io/badge/%40nestjs%2Fcli-%5E9.1.1-blue)
![typescript](https://img.shields.io/badge/typescript-%5E4.8.2-blue)
![cheerio](https://img.shields.io/badge/cheerio-1.0.0--rc.12-blue)
![mongoose](https://img.shields.io/badge/mongoose-%5E6.5.4-blue)

#### About this repository:

  - 透過爬蟲技術取得[跑者廣場-全國賽會](http://www.taipeimarathon.org.tw/contest.aspx)的資料。
  - 目前尚在實驗階段，僅供學術研究用途使用，請勿直接使用在商業環境 ！
  - 資料取得方式: cronjob(每日03:00及15:00)，或可以透過API手動更新。

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

### License

[MIT licensed](LICENSE).
