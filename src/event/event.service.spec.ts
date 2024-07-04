import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { getModelToken } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Event } from './event.model';
import * as fs from 'fs';
import { join } from 'path';
import { EventOutputDto } from './dto/event.output.dto';
import { EventResponseDto } from './dto/response-output.dto';
import { EventInputDto } from './dto/event.input.dto';
import { SlackService } from 'nestjs-slack';

Object.defineProperty(global, 'performance', {
  writable: true,
});

jest.useFakeTimers().setSystemTime(new Date('2022-01-01'));

describe('EventService', () => {
  let service: EventService;

  const html = `
  <head><title>
    跑者廣場::全國賽會
  </title>
      <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>
      <script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js"></script>
      <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/themes/base/jquery-ui.css" type="text/css">
  
  <script type="text/javascript">
  
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-2905856-1']);
    _gaq.push(['_trackPageview']);
  
    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
  
  </script>
  <style type="text/css" media="screen">
      /*Tooltip and Pointer CSS*/
      .ui-tooltip { position:absolute; z-index:9999; font-size:11pt; font-family:Calibri;  text-align:left }
      body .ui-tooltip { border-width:2px; }
  
      .ui-button { display: inline-block; position: relative; padding: 0; margin: 0; margin-right: .3em; text-decoration: none !important; cursor: pointer; text-align: center; zoom: 1; overflow: visible; }
      /*button text element */
      .ui-button .ui-button-text { display: block; line-height: 0.4;  }
      .ui-button-text-only .ui-button-text { padding: .3em .45em; }
      .limit { background: #F4CAD6; } 
  
      a:link,a:visited
      {
    color:#03c;
    text-decoration: none
      }
  
      a:hover 
      {
    color:#339;
    text-decoration:underline;
      }
  
      .splitline 
      { 
         border-top:1px solid green;
      }
      tr.rowbackgroundcolor .datecell
      {
          #background-color: #cccccc;
    #background-color: #cccccc;
    border-left:2px solid #999999;
    border-right:2px solid #FFFFFF;
      }
      tr:not(.rowbackgroundcolor)     .datecell
      {
          #background-color: #cccccc;
    #background-color: #cccccc;
    border-left:2px solid #FFFFFF;
    border-right:2px solid #999999;
      }
      
      .rowbackgroundcolor-select
      {
          background-color: #FFE178;
      }
      .select
      {
          background-color: #FFE178;
      }
      .gridview
      {
          border-color: #999999;
          border-style: solid;
          border-width: 1px;
          border-collapse: collapse;
          border-left-style: none;
          border-top-style: none;
      }
      #monthtag
      {
    position:absolute;
    background-color:lightgreen;
    color:MidnightBlue;
    
    top:-8px;
    left:16px;
    border-top: solid 1px #ccc;
    border-left: solid 1px #ccc;
    border-right: solid 1px #666;
    border-bottom: solid 1px #666;
    
    font-size:11px;
    font-weight:bold;
    line-height:14px;
      
    border-radius:5px;
    -moz-border-radius:5px;
    -webkit-border-radius:5px;
    -webkit-text-size-adjust:none;
    width:32px;
    text-align:center;
      }
      
      .newcell
      {
          vertical-align:top;
          border-style:none;
          background-color:White;
          border-top-style:hidden;
          width:35px;
    position:relative;
      }
  
      .oldactivity
      {
    color:#888;	
      }
      .oldactivity A:link { color:#888;}
      .oldactivity A:visited { color:#888;}
      .oldactivity A:hover { color:#888;}
      .oldactivity A:active { color:#888;}
      
  
  
      ul#menubar
      {
          border:1px solid #5F5F5F;
          margin:0px;list-style:none;padding:2px;margin-bottom:10px;
          -moz-border-radius:5px;-webkit-border-radius:5px;border-radius:5px;
          -webkit-box-shadow: #666 0px 2px 3px;     /*陰影for Google Chrome、Safari*/
          -moz-box-shadow: #666 0px 2px 3px;     /*陰影for Firefox*/
          box-shadow: #666 0px 2px 3px;     /*陰影for IE*/
          background: #dedede;
          background-image: -webkit-gradient(linear, 0 0, 0 bottom, from(#FFFFFF), to(#dedede));    /*漸層色for Google Chrome、Safari*/
          background: -moz-linear-gradient(#FFFFFF, #dedede);     /*漸層色for Firefox*/ 
          display:block;float:left;
      }
      ul#menubar ul
      {
          text-align:right;
      }
      
      ul#menubar li.menubar
      {
        height:30px;line-height:30px; width:250px;
    }
    ul#menubar li
    {
        display:block;white-space:nowrap;float:left;border-style:none;
    }
    
      
  </style>
      <script>
      $(function() {
          $("button").button().click(function( event ) {
                  event.preventDefault();
              });
    $("button").tooltip({      track: true    });
      });
      </script>
  <script>
      function select(obj) 
      {
          if (obj.className=="rowbackgroundcolor-select" || obj.className=="select") 
    {
            if (obj.className=="rowbackgroundcolor-select")
                  obj.className="rowbackgroundcolor"
            else
                  obj.className=""
        } 
        else
    {
      if (obj.className=="")
              obj.className="select"
      else
        obj.className="rowbackgroundcolor-select"
    }
      }
  </script></head>
  
  <body style="text-align: center; font-family: Verdana;">
      <form method="post" action="./contest.aspx" id="form1">
  <input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="/wEPDwUKMjEyNDQyNDAxN2QYAQUJR3JpZFZpZXcxDzwrAAwBCAIBZN3lnQB0WsNZoSfL435brS+rPEnvicUA+20vpJe0R7hN">
  
  <input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="9A03162A">
  <input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="/wEdACUIRgNcv+Eo+izsloED55S2miySQFhVXaajPP9Glfhh5F3j3Kittku3UXzkx6J8vRIlO87ldFq+TOQExVEoy62slhJAKm+ljV6Ef6ypUkhJijAQz0AkgUXFMXoP5U0QmqzNt3VdO/p5aWcjhwfS4JqUlQ4twNwr8/PPTxKTtKAfuyUTK8t5d3JXDImzLv71btnH/eoi1ZYTk+noso4sLe0IS4bLS4F/6UTd9+BNt0SLVbo6KlKlAqDpYQGkkLwbGFt9WmLned75n9Bpk2NyJS7WNmLyJCqWwjEb/NoBpUv8F5x36FBrX/owtmnDxkG42QzxVu/SlEXFrQm15lUkrqp8Nl710DTafh3cCqv6Dql/etpmpj67L93lOD3O+gmZIExfNYYVlsjzT0WS5I2I+yYt/VoM77IPjKFkxOtaQrOId/xQGQbG8imRjNhTGBYQN4szO4X5aaMFZEmAfXr+8dlSn6QKdph+HW7Tum3QylENLWyErlMeT1PA17aVbK9XtfS6/L4P9HreF/Fz2HTbnQFaM9Yq/a/UhDoYYWIN7ETQqCgNDsoIhG+imkrkZp34mfPKlK5o30LzoD7gbef528ubj19yVDElG2H25wrkZp/PMrkLvQyuTmE/ThG0YIK6hxC/XCtSblB1r32Zemn4USbxUNCGdLJwXpZYVR+MY1oyQid5Epc007LVg1gMlKx4lEes7EEVLEFmzaBNN7kdl8kIPNnJDhVxv/1jYLyCfbNcdLRU/oaIAi3u4L4Nha5bPW2BD1tBhzPUOeNV5rIGuI6kkdifOckwVIeUomL2d+E316XUb57XcC0sO/g96zBnPXg=">
      <p></p><h1>
      全國賽會
      </h1><p></p>
   <!--   <p><img src="/images/new.gif"><a href="contestnew.aspx">新版全國賽會</a><img src="/images/new.gif"></p> -->
      <p>歡迎各單位登錄賽事，請聯絡 <a href="mailto:marathoner300@gmail.com">全國賽會服務組</a></p>
      <p>*如對各項賽事有任何疑問，請逕洽賽事主辦單位，網頁管理者恕不回答相關賽事問題。</p>
      <p><img src="/images/iaaf.gif">：<a href="http://www.iaaf.org/competitions/iaaf-label-road-races/calendar/">IAAF</a>認證賽事　　　　<img src="/images/aims_logo.gif">：<a href="http://aimsworldrunning.org/">AIMS</a>認證賽事　　　　<img src="/images/course_ok.png">：本賽道經AIMS/IAAF丈量員丈量</p>
              <table style="border-top-style: none; border-right-style: none; border-left-style: none; border-bottom-style: none ;" align="center">
                      <tbody><tr>
                          <td>
                          
                        <ul id="menubar">
                                  <li class="menubar">
                                      賽事日期：<select name="Year" id="Year">
    <option value="all">歷史賽事</option>
    <option value="2005">2005</option>
    <option value="2006">2006</option>
    <option value="2007">2007</option>
    <option value="2008">2008</option>
    <option value="2009">2009</option>
    <option value="2010">2010</option>
    <option value="2011">2011</option>
    <option value="2012">2012</option>
    <option value="2013">2013</option>
    <option value="2014">2014</option>
    <option value="2015">2015</option>
    <option value="2016">2016</option>
    <option value="2017">2017</option>
    <option value="2018">2018</option>
    <option value="2019">2019</option>
    <option value="2020">2020</option>
    <option value="2021">2021</option>
    <option value="2022">2022</option>
    <option selected="selected" value="now">目前賽事</option>
  
  </select>
                                  </li>
                                  <li class="menubar">
                                      賽事地點
                                      ：<select name="DropDownList1" id="DropDownList1">
    <option selected="selected" value="all">全部</option>
    <option value="北">北部</option>
    <option value="中">中部</option>
    <option value="南">南部</option>
    <option value="東">東部</option>
    <option value="其他">其他</option>
  
  </select>
                                  </li>
                                  <li class="menubar">
                                      賽事種類
                                      ：<select name="type" id="type">
    <option selected="selected" value="public">全國賽會</option>
    <option value="all">全部</option>
    <option value="1">超級馬拉松</option>
    <option value="2">馬拉松</option>
    <option value="3">半程馬拉松</option>
    <option value="4">10k~半馬</option>
    <option value="5">10k以下</option>
    <option value="6">休閒活動</option>
    <option value="7">鐵人賽</option>
    <option value="8">接力賽</option>
  
  </select>
                                  </li>
                                  <li class="menubar"><a href="?lang=en-US">English</a></li>
                              </ul>
                          </td>
                      </tr>
                  </tbody></table>
  
          <div>
    <table class="gridview" cellspacing="0" cellpadding="4" align="Center" id="GridView1" bgcolor="White">
      <tbody><tr bgcolor="Black">
        <th scope="col" bgcolor="White"><font color="White"><b>&nbsp;</b></font></th><th scope="col"><font color="White"><b>賽事名稱</b></font></th><th scope="col"><font color="White"><b>&nbsp;</b></font></th><th scope="col"><font color="White"><b>日期</b></font></th><th scope="col"><font color="White"><b>地點</b></font></th><th scope="col"><font color="White"><b>里程</b></font></th><th scope="col"><font color="White"><b>承辦單位</b></font></th><th scope="col"><font color="White"><b>報名日期</b></font></th>
      </tr><tr class="splitline oldactivity" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <span id="monthtag">9月</span>
                      </font></td><td width="340"><font color="Black">
                          <a href="http://www.cloudultra.run/">Cloud Ultra</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/03 六 04:00
                      </font></td><td><font color="Black">臺中市和平區雙崎921紀念公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：">73K</button><button title="費用：">58K</button>
                      </font></td><td width="15%"><font color="Black">臺灣跑山獸</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" oldactivity" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340" style="text-decoration:line-through;"><font color="Black">
                          <a href="https://irunner.biji.co/taiping2021?page=1310">*2021 太平山雲端漫步*(延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/03 六 07:00
                      </font></td><td><font color="Black">宜蘭縣大同鄉太平山山莊廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1800<br/>限額：共1500人" class="limit">42.195K</button><button title="費用： 1800<br/>限額： 共1500人" class="limit">21K</button>
                      </font></td><td width="15%"><font color="Black">宜蘭縣鐵人三項協會/羅東聖母醫院</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" oldactivity" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5235#25396">2022 年宜蘭梅花湖111學年度全國鐵人三項錦標賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/03 六 08:00
                      </font></td><td><font color="Black">宜蘭縣冬山鄉梅花湖風景區</font></td><td width="15%"><font color="Black">
                          <button title="費用：">1.5K+40K+10K</button><button title="費用：">0.75K+20K+5K</button><button title="費用：">0.4K+5K+1.25K</button><button title="費用：">0.2K+5K+1.25K</button>
                      </font></td><td width="15%"><font color="Black">宜蘭縣政府/中華民國鐵人三項運動協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/4774#23453">2022 山城星光馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/03 六 16:30
                      </font></td><td><font color="Black">苗栗縣苗栗市縣立體育場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000">42.195K</button><button title="費用： 700">21K</button><button title="費用： 600">9K</button><button title="費用： 300">3K</button>
                      </font></td><td width="15%"><font color="Black">苗栗縣路跑協會/育達科技大學休閒運動管理系</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.taipeicityrun.com/">2022 Taipei City Run 臺北城市路跑賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/04 日 05:30
                      </font></td><td><font color="Black">臺北市中正區總統府</font></td><td width="15%"><font color="Black">
                          <button title="費用：700<br/>限額：8000" class="limit">12.5K</button><button title="費用： 500<br/>限額： 3000" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">中華民國文化休閒運動協會/中華民國路跑協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Flytiger2022/">2022 飛虎半程全國馬拉松賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/04 日 06:00
                      </font></td><td><font color="Black">雲林縣虎尾鎮農博公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：900<br/>限額：1000" class="limit">21K</button><button title="費用： 700<br/>限額： 1000" class="limit">10K</button><button title="費用： 500<br/>限額： 1000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">雲林縣飛虎常跑協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/4698#23111">2022 情定愛文山芒果公益路跑(由2022/6/26延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/04 日 06:00
                      </font></td><td><font color="Black">臺南市玉井區愛文山食農教育園區</font></td><td width="15%"><font color="Black">
                          <button title="費用：900">21K</button><button title="費用： 700">10K</button><button title="費用： 450">3K</button>
                      </font></td><td width="15%"><font color="Black">臺南市愛文山人文產業發展協會/蜜旺果舖</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://reurl.cc/M00vOW">2022 ZEPRO RUN 全國半程馬拉松-嘉義場(由2022/4/24延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/04 日 06:00
                      </font></td><td><font color="Black">嘉義市西區二二八國家紀念公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：">21K</button><button title="費用：">10K</button><button title="費用：">5.5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣運動賽事協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.facebook.com/events/533251324420303/?acontext=%7B%22ref%22%3A%2252%22%2C%22action_history%22%3A%22[%7B%5C%22surface%5C%22%3A%5C%22share_link%5C%22%2C%5C%22mechanism%5C%22%3A%5C%22share_link%5C%22%2C%5C%22extra_data%5C%22%3A%7B%5C%22invite_link_id%5C%22%3A816001445763555%7D%7D]%22%7D">腳ㄚ子百K接力邀請賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/04 日 06:30
                      </font></td><td><font color="Black">屏東縣恆春鎮鵝鑾鼻公園停車場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000">104K</button>
                      </font></td><td width="15%"><font color="Black">楊大慶和腳ㄚ子路跑&amp;探索屏東故鄉之美</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://goldmedal.run/wvM5x">2022 愛女孩 跑出不凡</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/04 日 06:30
                      </font></td><td><font color="Black">臺北市中山區大佳河濱公園(巨蛋廣場)</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000<br/>限額：2000" class="limit">21K</button><button title="費用： 800<br/>限額： 1500" class="limit">10K</button><button title="費用： 550<br/>限額： 1500" class="limit">4K</button>
                      </font></td><td width="15%"><font color="Black">愛女孩國際關懷協會/展通虹策略整合行銷股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5230#25364">2022 榮耀九三向國軍致敬路跑嘉年華</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/04 日 06:30
                      </font></td><td><font color="Black">桃園市大溪區石門水庫南苑公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：">42.195K</button><button title="費用：">21K</button><button title="費用：">10K</button><button title="費用：">4K</button>
                      </font></td><td width="15%"><font color="Black">桃園市復興崗校友會 </font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.focusline.com.tw/20911YG/Activities/Activities.aspx">2022 第一屆太平雲梯雲端路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/11 日 07:00
                      </font></td><td><font color="Black">嘉義縣梅山鄉太平雲梯遊客中心</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000<br/>限額：2000" class="limit">15K</button><button title="費用： 500<br/>限額： 1000" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">有限責任嘉義縣梅山鄉太平社區產業合作社/嘉義縣梅山鄉太平社區發展協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5111#25030">2022 台灣棲蘭林道越野</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/17 六 05:00
                      </font></td><td><font color="Black">宜蘭縣大同鄉100林道口</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：200" class="limit">100K</button><button title="費用：<br/>限額： 340" class="limit">50K</button><button title="費用：<br/>限額： 360" class="limit">25K</button><button title="費用：<br/>限額： 100" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">社團法人中華民國超級馬拉松運動協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://reurl.cc/3oved8">2022 鄉鎮之美馬拉松-彰化溪湖場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/17 六 05:00
                      </font></td><td><font color="Black">溪湖鎮開天宮(彰化縣溪湖鎮環河路二段816號)</font></td><td width="15%"><font color="Black">
                          <button title="費用：">42.6K</button><button title="費用：">21.3K</button><button title="費用：">7.1K</button>
                      </font></td><td width="15%"><font color="Black">欣恩創意國際有限公司</font></td><td align="right" width="130"><font color="Black">
                          7月13日 ~ 9月03日<br><font color="red">(最後一天)</font>
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.photou.com.tw/zh/activity/activity_desc.php?activity=96">2022 基隆瑪陵-女巫秘境馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/17 六 06:00
                      </font></td><td><font color="Black">基隆市七堵區瑪東農村公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：990<br/>限額：共400人" class="limit">42.195K</button><button title="費用： 890<br/>限額： 共400人" class="limit">21K</button><button title="費用： 790<br/>限額： 共400人" class="limit">12K</button><button title="費用： 500<br/>限額： 共400人" class="limit">6K</button>
                      </font></td><td width="15%"><font color="Black">瑪東社區發協會/瑪西社區發展協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.bao-ming.com/eb/content/5243#25428">2022 捷安特自行車嘉年華 - 大小鐵人兩項、PushBike童樂會</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/17 六 06:00
                      </font></td><td><font color="Black">臺中市后里區麗寶國際賽車場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1699<br/>限額：750" class="limit">2K+40K+10K</button><button title="費用： 899<br/>限額： 250" class="limit">0.8K+3K+2K</button><button title="費用： 900<br/>限額： 250" class="limit">0.4K+3K+1K</button>
                      </font></td><td width="15%"><font color="Black">財團法人自行車新文化基金會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/ARHukou2022/">2022 全民AR健跑闖關大會獅-湖口場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/17 六 07:00
                      </font></td><td><font color="Black">新竹縣湖口鄉湖口三元宮</font></td><td width="15%"><font color="Black">
                          <button title="費用：0<br/>限額：500" class="limit">10K</button><button title="費用： 0<br/>限額： 1000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">新竹縣政府</font></td><td align="right" width="130"><font color="Black">
                          7月11日 ~ 9月12日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5251#25418">2022 第四屆馬祖莒光定向夜跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/17 六 15:30
                      </font></td><td><font color="Black">連江縣莒光鄉東莒燈塔廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：">8K</button>
                      </font></td><td width="15%"><font color="Black">連江縣交通旅遊局</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/4800#23519">2022 新竹縣五峰鄉戰慄雪霸~勇士之歌超級馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/18 日 05:00
                      </font></td><td><font color="Black">新竹縣五峰鄉清泉頭目廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：550" class="limit">100K</button><button title="費用：<br/>限額： 250" class="limit">80K</button><button title="費用：<br/>限額： 300" class="limit">55K</button><button title="費用：<br/>限額： 400" class="limit">44K</button>
                      </font></td><td width="15%"><font color="Black">五峰鄉公所/中華13知路跑協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ibodygo.com.tw/EventTopic.aspx?n=1310">第16屆大腳丫森林-八卦茶園馬拉松(由2022/4/24延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/18 日 06:00
                      </font></td><td><font color="Black">南投縣竹山鎮竹山國中</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：600" class="limit">43K</button><button title="費用： 1000<br/>限額： 800" class="limit">21K</button><button title="費用： 800<br/>限額： 600" class="limit">10K</button><button title="費用： 600<br/>限額： 300" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">竹山鎮公所/臺灣大腳丫長跑協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://reurl.cc/1ZZ0Vp">2022 ZEPRO RUN 全國半程馬拉松-新北場(由2022/5/1延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/18 日 06:00
                      </font></td><td><font color="Black">新北市板橋區浮洲橋下</font></td><td width="15%"><font color="Black">
                          <button title="費用：">21K</button><button title="費用：">10K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣運動賽事協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5100#24758">2022 TIS 桃園市第二屆鐵人兩項錦標賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/18 日 06:30
                      </font></td><td><font color="Black">桃園市大園區竹圍漁港天幕廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：">5.4K+30.7K+5.4K</button>
                      </font></td><td width="15%"><font color="Black">桃園市鐵人運動協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5179#25109">2022 年「武陵馬拉松」</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/18 日 06:30
                      </font></td><td><font color="Black">臺中市和平區武陵農場遊客中心</font></td><td width="15%"><font color="Black">
                          <button title="費用：1600<br/>限額：300" class="limit">42.195K</button><button title="費用： 1400<br/>限額： 200" class="limit">21K</button><button title="費用： 1100<br/>限額： 200" class="limit">11K</button><button title="費用： 800<br/>限額： 200" class="limit">6K</button>
                      </font></td><td width="15%"><font color="Black">榮耀九三運動協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340" style="text-decoration:line-through;"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5037#24437">*2022 貢寮桃源谷馬拉松路跑賽*</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/18 日 07:30
                      </font></td><td><font color="Black">新北市貢寮區貢寮國中</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000<br/>限額：1000" class="limit">42.195K</button><button title="費用： 900<br/>限額： 1000" class="limit">21K</button>
                      </font></td><td width="15%"><font color="Black">威瀚運動行銷公司/好野人越野俱樂部</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Luzhu2022/">2022 蘆憶田園風光路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/18 日 08:00
                      </font></td><td><font color="Black">桃園市蘆竹區機場捷運A11 坑口站</font></td><td width="15%"><font color="Black">
                          <button title="費用：200<br/>限額：1000" class="limit">12K</button>
                      </font></td><td width="15%"><font color="Black">桃園市蘆竹區公所</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://docs.google.com/forms/d/e/1FAIpQLSdR9iXIhseF_ePSPwgEOk700qICX4R6X7Lk4qY9h2n4HeZIHg/viewform">2022 金門鐵人三項挑戰賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/18 日 08:00
                      </font></td><td><font color="Black">金門縣金沙鎮官澳</font></td><td width="15%"><font color="Black">
                          <button title="費用：2500<br/>限額：共600人" class="limit">1.5K+45K+10K</button><button title="費用： 1500<br/>限額： 共600人" class="limit">40K+10K</button><button title="費用： 200<br/>限額： 共600人" class="limit">7K</button>
                      </font></td><td width="15%"><font color="Black">金門體育會鐵人三項運動委員會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="http://twrunner.soonnet.org/">最強市民飆5K－新北市5000公尺挑戰賽 九月場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/21 三 18:30
                      </font></td><td><font color="Black">新北市板橋區板橋第一運動場  </font></td><td width="15%"><font color="Black">
                          <button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">捷迅股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          9月12日 ~ 9月18日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340" style="text-decoration:line-through;"><font color="Black">
                          *2022 華山論劍湖超級馬拉松*
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/24 六
                      </font></td><td><font color="Black">雲林縣</font></td><td width="15%"><font color="Black">
                          <button title="費用：">100K</button><button title="費用：">52K</button>
                      </font></td><td width="15%"><font color="Black">眾點資訊有限公司</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.focusline.com.tw/20924BU/Activities/Activities.aspx?Page=Txt201811271200033478_ran">5th CRUFU RUN 夸父追日跨夜接力賽-西臺灣站</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/24 六 06:00
                      </font></td><td><font color="Black">苗栗縣三義鄉西湖渡假村</font></td><td width="15%"><font color="Black">
                          <button title="費用：">240K</button>
                      </font></td><td width="15%"><font color="Black">司格特國際運動行銷有限公司</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/ARBeipu2022/">2022 全民AR健跑闖關大會獅-竹東場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/24 六 07:00
                      </font></td><td><font color="Black">新竹縣竹東鎮竹東河濱槌球場</font></td><td width="15%"><font color="Black">
                          <button title="費用：0<br/>限額：500" class="limit">10K</button><button title="費用： 0<br/>限額： 1000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">新竹縣政府</font></td><td align="right" width="130"><font color="Black">
                          7月11日 ~ 9月19日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Shibajianshan2022/">新竹市111年「風起竹嶺、百年飛颺」十八尖山路跑活動</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/24 六 08:00
                      </font></td><td><font color="Black">新竹市國立新竹高級中學</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：1000" class="limit">5.6K</button>
                      </font></td><td width="15%"><font color="Black">新竹市政府</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://docs.google.com/document/d/1K3NR12HauOfnqYNWac66b3RCPtwM7Qz7/edit?usp=sharing&amp;ouid=110764794774391593445&amp;rtpof=true&amp;sd=true">國立虎尾科技大學第九屆我的鐵人家庭</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/24 六 09:00
                      </font></td><td><font color="Black">雲林縣虎尾鎮國立虎尾科技大學</font></td><td width="15%"><font color="Black">
                          <button title="費用：0">0.4K+6K+3K</button>
                      </font></td><td width="15%"><font color="Black">國立虎尾科技大學體育室</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="http://www.ironman.org.tw/index.php/107">2022 臺北星光馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/24 六 16:30
                      </font></td><td><font color="Black">臺北市中山區大佳河濱公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100<br/>限額：2000" class="limit">42.3K</button><button title="費用： 1000<br/>限額： 2000" class="limit">21.5K</button><button title="費用： 900<br/>限額： 2000" class="limit">11K</button>
                      </font></td><td width="15%"><font color="Black">臺灣鐵人運動協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://reurl.cc/8o5Qpg">2021 DADA STARRY NIGHT RUN星光夜跑 - 屏東站(由2022/5/7延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/24 六 18:00
                      </font></td><td><font color="Black">屏東縣東港鎮大鵬灣青洲遊憩區</font></td><td width="15%"><font color="Black">
                          <button title="費用：">12K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">全統運動用品股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/SuHua2021/">2022 蘇花馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/25 日 06:00
                      </font></td><td><font color="Black">宜蘭縣蘇澳鎮蘇澳港停車場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：1500" class="limit">42.195K</button><button title="費用： 1100<br/>限額： 1500" class="limit">21K</button><button title="費用： 900<br/>限額： 1000" class="limit">11K</button><button title="費用： 600<br/>限額： 1000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">蘇澳鎮體育會慢跑委員會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5032#24429">2022 年桃園市議會議長盃路跑(由2022/4/10延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/25 日 06:00
                      </font></td><td><font color="Black">桃園市中壢區青埔棒球場</font></td><td width="15%"><font color="Black">
                          <button title="費用：600<br/>限額：1000" class="limit">21K</button><button title="費用： 400<br/>限額： 4000" class="limit">10K</button><button title="費用： 200<br/>限額： 5000" class="limit">4.5K</button>
                      </font></td><td width="15%"><font color="Black">桃園市馬拉松路跑協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/sanyi2022/">苗栗縣三義慢城慈善公益觀光路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/25 日 06:00
                      </font></td><td><font color="Black">苗栗縣三義鄉公有停車場(三義全聯前方)</font></td><td width="15%"><font color="Black">
                          <button title="費用：980<br/>限額：2000" class="limit">21K</button><button title="費用： 850<br/>限額： 2000" class="limit">11K</button><button title="費用： 600<br/>限額： 2000" class="limit">6K</button>
                      </font></td><td width="15%"><font color="Black">雙潭農業文旅產業發展協會/舊山線休閒農業區推動發展協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5166#25055">2022 第十屆臺南秋季馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/25 日 06:00
                      </font></td><td><font color="Black">臺南市官田區烏山頭水庫</font></td><td width="15%"><font color="Black">
                          <button title="費用：1300<br/>限額：1000" class="limit">42.195K</button><button title="費用： 1150<br/>限額： 1000" class="limit">21K</button><button title="費用： 1000<br/>限額： 1000" class="limit">11K</button><button title="費用： 850<br/>限額： 1000" class="limit">4K</button>
                      </font></td><td width="15%"><font color="Black">光圈整合行銷有限公司</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="http://www.sportsnet.org.tw/20220612_web/">臺北市第十九屆舒跑杯路跑競賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/25 日 06:00
                      </font></td><td><font color="Black">臺北市信義區市民廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：100<br/>限額：11000" class="limit">9K</button><button title="費用： 100<br/>限額： 9000" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">維他露食品公司</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5187#25110">2022 斯卡羅 SEQALU 越野跑(由2022/5/29延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/25 日 07:00
                      </font></td><td><font color="Black">屏東縣恆春鎮墾丁大灣草坪</font></td><td width="15%"><font color="Black">
                          <button title="費用：600">16K</button>
                      </font></td><td width="15%"><font color="Black">屏東縣政府/LAVA Sports 鐵人公司</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5027#24426">2022 FORCE 洄瀾鐵人三項賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          09/25 日 07:00
                      </font></td><td><font color="Black">花蓮縣壽豐鄉鯉魚潭風景區</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：600" class="limit">1.9K+90K+21K</button><button title="費用：<br/>限額： 800" class="limit">1.5K+45K+10K</button><button title="費用：<br/>限額： 200" class="limit">0.75K+23K+5K</button><button title="費用：<br/>限額： 200" class="limit">5K+45K+10K</button>
                      </font></td><td width="15%"><font color="Black">中華民國越野鐵人三項協會/瘋三鐵股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class="splitline rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <span id="monthtag">10月</span>
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/4784#23867">運動i臺灣2022臺東之美鐵人三項國際賽(由2021/10/2延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/01 六
                      </font></td><td><font color="Black">臺東縣臺東市森林公園活水湖</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：400" class="limit">1.9K+90K+21.1K</button><button title="費用：<br/>限額： 1200" class="limit">1.5K+40K+10K</button><button title="費用：<br/>限額： 400" class="limit">3K+40K+10K</button><button title="費用：<br/>限額： 800" class="limit">0.75K+20K+5K</button>
                      </font></td><td width="15%"><font color="Black">臺東縣鐵人三項委員會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.focusline.com.tw/21001YB/Activities/Activities.aspx?Page=Txt201706221532139638_ran">2022 福德財神寒冬送暖公益路跑賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/01 六 05:30
                      </font></td><td><font color="Black">嘉義市蘭潭泛月廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：600<br/>限額：200" class="limit">43.5K</button><button title="費用： 500<br/>限額： 200" class="limit">25K</button>
                      </font></td><td width="15%"><font color="Black">福德財神廟(福安里)/諸羅山長跑協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/watermelon2022">2022 新豐西瓜暨稻米文化路跑(由2022/9/9延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/01 六 06:00
                      </font></td><td><font color="Black">新竹縣新豐鄉池和宮</font></td><td width="15%"><font color="Black">
                          <button title="費用：780<br/>限額：400" class="limit">21K</button><button title="費用： 680<br/>限額： 400" class="limit">12K</button><button title="費用： 380<br/>限額： 700" class="limit">6K</button>
                      </font></td><td width="15%"><font color="Black">新竹縣新豐鄉公所/新竹縣新豐鄉民代表會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://psr.pocari.com.tw/">2022 POCARI SWEAT RUN 寶礦力路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/01 六 06:30
                      </font></td><td><font color="Black">臺北市中山區大佳河濱公園蛋型廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：900<br/>限額：3100" class="limit">21K</button><button title="費用： 700<br/>限額： 3900" class="limit">10K</button><button title="費用： 550<br/>限額： 3000" class="limit">4K</button><button title="費用： 400<br/>限額： 2500" class="limit">線上跑</button>
                      </font></td><td width="15%"><font color="Black">金車大塚股份有限公司/寶康行銷股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.eventpal.com.tw/FOAS/actions/ActivityIndex.action?showTabContent&amp;seqno=87d0e554-806f-49a4-a06b-654d023102d3">2022 神獸盃公益夜跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/01 六 16:30
                      </font></td><td><font color="Black">臺北市文山區道南河濱公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：850<br/>限額：150" class="limit">21K</button><button title="費用： 650<br/>限額： 500" class="limit">10K</button><button title="費用： 550<br/>限額： 300" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">元太道堂/社團法人元太慈愛人文推廣協進會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5229#25382">2022 年火燒島全國馬拉松賽 </a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/02 日 05:30
                      </font></td><td><font color="Black">臺東縣綠島鄉綠島人權紀念公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100<br/>限額：300" class="limit">42.195K</button><button title="費用： 900<br/>限額： 700" class="limit">21K</button><button title="費用： 500<br/>限額： 600" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">綠島鄉公所</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ironman.com/im703-kenting">IRONMAN 70.3 墾丁鐵人三項賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/02 日 06:00
                      </font></td><td><font color="Black">屏東縣恆春鎮墾丁福華飯店</font></td><td width="15%"><font color="Black">
                          <button title="費用：">1.9K+90K+21.1K</button>
                      </font></td><td width="15%"><font color="Black">LAVA Sports 鐵人公司</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/twnmarathon2022">2022 臺灣HAKKA好客國際馬拉松in新竹湖口</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/02 日 06:00
                      </font></td><td><font color="Black">新竹縣湖口鄉好客文創園區</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：900" class="limit">42.195K</button><button title="費用： 1000<br/>限額： 800" class="limit">21K</button><button title="費用： 800<br/>限額： 700" class="limit">10K</button><button title="費用： 600<br/>限額： 933" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">臺灣國際馬拉松交流協會/亞洲馬拉松大聯盟</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/XinWuMarathon2022/">2022 新屋魚米之鄉馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/02 日 06:00
                      </font></td><td><font color="Black">桃園市新屋區農業博覽會基地</font></td><td width="15%"><font color="Black">
                          <button title="費用：850<br/>限額：3500" class="limit">21K</button><button title="費用： 650<br/>限額： 5000" class="limit">10K</button><button title="費用： 350<br/>限額： 3500" class="limit">4K</button>
                      </font></td><td width="15%"><font color="Black">桃園市政府/桃園市路跑協會</font></td><td align="right" width="130"><font color="Black">
                          6月10日 ~ 9月12日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://reurl.cc/ErXkXm">2022 DADA RUN 皇冠路跑趣-屏東站(由2022/5/15延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/02 日 06:00
                      </font></td><td><font color="Black">屏東縣長治鄉農業生物科技園區</font></td><td width="15%"><font color="Black">
                          <button title="費用：">10K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣運動賽事協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340" style="text-decoration:line-through;"><font color="Black">
                          <a href="https://lohasnet.tw/Tamio2022/">*「大吉-嘉泰獅」2022嘉義民雄鬼屋國際公益馬拉松*</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/02 日 06:10
                      </font></td><td><font color="Black">嘉義縣民雄鄉大吉國中</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000<br/>限額：2000" class="limit">42.195K</button><button title="費用： 900<br/>限額： 2000" class="limit">21K</button><button title="費用： 700<br/>限額： 1000" class="limit">10K</button><button title="費用： 500<br/>限額： 1000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">嘉義縣大吉國中/嘉義市體育運動總會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.eventpal.com.tw/FOAS/actions/ActivityIndex.action?showTabContent&amp;seqno=66f570c1-2908-4019-8bdd-1fa9e8deb50a">2022 高美濕地海風公益路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/02 日 06:10
                      </font></td><td><font color="Black">臺中市清水區海生館旁道路</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100<br/>限額：1400" class="limit">21K</button><button title="費用： 950<br/>限額： 1500" class="limit">12K</button><button title="費用： 750<br/>限額： 1500" class="limit">6K</button>
                      </font></td><td width="15%"><font color="Black">聯網國際資訊股份有限公司(活動咖)/臺中市政府運動局</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ibodygo.com.tw/EventTopic.aspx?n=1220">2022 博克多烏來馬拉松(由2021/10/3延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/02 日 06:30
                      </font></td><td><font color="Black">新北市烏來區勇士廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000<br/>限額：1900" class="limit">42.195K</button><button title="費用： 600<br/>限額： 600" class="limit">21.1K</button><button title="費用： 300<br/>限額： 300" class="limit">6.5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣環島跑者聯盟協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.runningadeux.com/tmd">2022 大肚山越野</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/02 日 07:00
                      </font></td><td><font color="Black">臺中市大肚區環保公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：1400">30K</button><button title="費用： 800">12K</button><button title="費用： 800">4K</button>
                      </font></td><td width="15%"><font color="Black">鐵蟲二人組</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/ARZhubei2022/">2022 全民AR健跑闖關大會獅-竹北場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/02 日 07:00
                      </font></td><td><font color="Black">新竹縣竹北市第一體育場</font></td><td width="15%"><font color="Black">
                          <button title="費用：0<br/>限額：500" class="limit">9K</button><button title="費用： 0<br/>限額： 1000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">新竹縣政府</font></td><td align="right" width="130"><font color="Black">
                          7月11日 ~ 9月26日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5239#25455">2022 RUN TO LOVE 公益路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/02 日 08:00
                      </font></td><td><font color="Black">高雄市鳥松區澄清湖第二停場</font></td><td width="15%"><font color="Black">
                          <button title="費用：800<br/>限額：800" class="limit">12K</button><button title="費用： 700<br/>限額： 1200" class="limit">6K</button><button title="費用： 600<br/>限額： 2000" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">高雄市不動產仲介經紀商業同業公會/創世基金會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340" style="text-decoration:line-through;"><font color="Black">
                          *2022 第四屆全民運X跑若飛天公盃半程馬拉松*
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/08 六
                      </font></td><td><font color="Black">嘉義縣朴子市老人會</font></td><td width="15%"><font color="Black">
                          <button title="費用：">21K</button><button title="費用：">12K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">&nbsp;</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.beclass.com/rid=25465b3619cf252439c8">2022 腳ㄚ子👣超級馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/08 六 05:00
                      </font></td><td><font color="Black">屏東縣屏東市河濱公園高屏大橋下</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000<br/>限額：200" class="limit">50K</button><button title="費用： 300<br/>限額： 100" class="limit">10K</button>
                      </font></td><td width="15%"><font color="Black">腳ㄚ子</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://reurl.cc/GEolNZ">2022 鄉鎮之美馬拉松-霧峰場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/08 六 05:00
                      </font></td><td><font color="Black">霧峰區921地震教育園區旁百姓公廟</font></td><td width="15%"><font color="Black">
                          <button title="費用：">43.6K</button><button title="費用：">23.4K</button><button title="費用：">7.8K</button>
                      </font></td><td width="15%"><font color="Black">欣恩創意國際有限公司</font></td><td align="right" width="130"><font color="Black">
                           ~ 9月24日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/SkyRun2022">2022 跑若飛天公盃路跑X健走大賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/08 六 06:00
                      </font></td><td><font color="Black">嘉義縣朴子市水道頭文創園區(朴子市山通路14號)</font></td><td width="15%"><font color="Black">
                          <button title="費用：950<br/>限額：500" class="limit">21K</button><button title="費用： 700<br/>限額： 1000" class="limit">11K</button><button title="費用： 500<br/>限額： 1500" class="limit">4K</button>
                      </font></td><td width="15%"><font color="Black">朴子市公所/朴子市體育會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ibodygo.com.tw/EventTopic.aspx?n=1343">2022 年盲人環臺公益熱身賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/08 六 08:00
                      </font></td><td><font color="Black">臺北市士林區溪山國小</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：200" class="limit">17K</button>
                      </font></td><td width="15%"><font color="Black">臺灣盲人環台為公益而跑協會</font></td><td align="right" width="130"><font color="Black">
                          8月25日 ~ 9月20日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5194#25150">2022 蓮池潭國際鐵人三項競賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/09 日 06:00
                      </font></td><td><font color="Black">高雄市左營區蓮池潭</font></td><td width="15%"><font color="Black">
                          <button title="費用：">1.5K+40K+10K</button>
                      </font></td><td width="15%"><font color="Black">高雄市體育總會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/Zhutang2022">2022 就愛竹塘米環鄉半程馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/09 日 06:30
                      </font></td><td><font color="Black">彰化縣竹塘鄉農會</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000<br/>限額：800" class="limit">22.8K</button><button title="費用： 800<br/>限額： 600" class="limit">9.6K</button><button title="費用： 600<br/>限額： 600" class="limit">4.8K</button>
                      </font></td><td width="15%"><font color="Black">竹塘鄉農會/舒康樂活有限公司</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5297#25565">2022 世界骨鬆日「福虎生風愛路跑、保骨健康沒煩惱」健康路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/09 日 06:30
                      </font></td><td><font color="Black">高雄市鳥松區澄清湖風景區(水漾會館)</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：1000" class="limit">12.5K</button><button title="費用：<br/>限額： 1000" class="limit">6.4K</button>
                      </font></td><td width="15%"><font color="Black">高雄醫學大學/高雄市澄清湖友緣慢跑協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5148#reg">2022 蘆洲觀音山馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/09 日 07:00
                      </font></td><td><font color="Black">新北市蘆洲區微風運河旁</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：共4000人" class="limit">42.195K</button><button title="費用：<br/>限額： 共4000人" class="limit">21K</button><button title="費用：<br/>限額： 共4000人" class="limit">10K</button><button title="費用：<br/>限額： 共4000人" class="limit">4K</button>
                      </font></td><td width="15%"><font color="Black">蘆洲區體育會/蘆洲慢跑</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/new.gif">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.focusline.com.tw/21010ZO/Activities/Activities.aspx">2022 信義鄉葡萄馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/10 一 06:30
                      </font></td><td><font color="Black">南投縣信義鄉梅子夢工廠</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：400" class="limit">42.195K</button><button title="費用： 1000<br/>限額： 400" class="limit">23.2K</button><button title="費用： 600<br/>限額： 400" class="limit">6K</button>
                      </font></td><td width="15%"><font color="Black">信義鄉公所</font></td><td align="right" width="130"><font color="Black">
                          9月02日 ~ 9月12日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/HSINCHUCITY2022">2022 新竹城市馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/15 六 05:30
                      </font></td><td><font color="Black">新竹市南寮運動公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：1600<br/>限額：2500" class="limit">42.195K</button><button title="費用： 1300<br/>限額： 3500" class="limit">26K</button><button title="費用： 1000<br/>限額： 2500" class="limit">10.6K</button><button title="費用： 750<br/>限額： 1500" class="limit">5.6K</button>
                      </font></td><td width="15%"><font color="Black">新竹市政府/運動筆記</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/4733#23242">2022 臺東超鐵Taitung Super 3</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/15 六 06:00
                      </font></td><td><font color="Black">臺東縣臺東市森林公園活水湖</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：300" class="limit">3.8K+180K+42.2K</button><button title="費用：<br/>限額： 600" class="limit">1.9K+90K+21.1K</button><button title="費用：<br/>限額： 700" class="limit">1.5K+40K+10K</button><button title="費用：<br/>限額： 200" class="limit">2.5K+40K+5K</button>
                      </font></td><td width="15%"><font color="Black">臺東縣超級鐵人三項協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ibodygo.com.tw/EventTopic.aspx?n=1317">第九屆杉林溪森林馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/15 六 06:40
                      </font></td><td><font color="Black">南投縣竹山鎮杉林溪大飯店前廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1400<br/>限額：600" class="limit">42.195K</button><button title="費用： 1300<br/>限額： 600" class="limit">21K</button><button title="費用： 1200<br/>限額： 600" class="limit">6.8K</button>
                      </font></td><td width="15%"><font color="Black">杉林溪森林生態渡假園區/杉林溪森林馬拉松俱樂部</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/LaborRun2022/">新北市第八屆工安盃路跑-工安向前行 勞雇雙贏 Follow me</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/15 六 06:40
                      </font></td><td><font color="Black">新北市板橋區浮洲自行車租借站</font></td><td width="15%"><font color="Black">
                          <button title="費用：500<br/>限額：1700" class="limit">10K</button><button title="費用： 200<br/>限額： 1300" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">新北市政府勞工局</font></td><td align="right" width="130"><font color="Black">
                          7月11日 ~ 9月12日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/TalentRun2022/">2022雲林路跑嘉年華--歡喜作伙找頭路，快樂運動虎薪情</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/15 六 08:00
                      </font></td><td><font color="Black">雲林縣斗六市雲林縣體育館</font></td><td width="15%"><font color="Black">
                          <button title="費用：300<br/>限額：500" class="limit">5K</button><button title="費用： 300<br/>限額： 500" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">雲林縣三鐵運動協會</font></td><td align="right" width="130"><font color="Black">
                          8月19日 ~ 9月24日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/2022Masadiforest">2022 花蓮大農大富平地森林健跑嘉年華</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/15 六 15:00
                      </font></td><td><font color="Black">花蓮縣光復鄉大農大富平地森林園區</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000<br/>限額：2000" class="limit">21K</button><button title="費用： 900<br/>限額： 1500" class="limit">12K</button><button title="費用： 700<br/>限額： 1500" class="limit">5K</button><button title="費用： 2000<br/>限額： 500隊" class="limit">21K接力</button>
                      </font></td><td width="15%"><font color="Black">花蓮縣體育會/花蓮縣光復鄉體育會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340" style="text-decoration:line-through;"><font color="Black">
                          <a href="https://lohasnet.tw/TaipeiEvening2022/">*2022 Taipei Beauty Evening Run 彩霞路跑*</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/15 六 16:00
                      </font></td><td><font color="Black">臺北市中山區大佳河濱公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：700<br/>限額：300" class="limit">10K</button><button title="費用： 400<br/>限額： 300" class="limit">4K</button>
                      </font></td><td width="15%"><font color="Black">儒揚文化運動行銷有限公司</font></td><td align="right" width="130"><font color="Black">
                          8月05日 ~ 9月18日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/4788#23435">2022 臺南鯤喜灣星光馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/15 六 16:00
                      </font></td><td><font color="Black">臺南市南區鯤鯓里活動中心前空地</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：3000" class="limit">42.195K</button><button title="費用： 900<br/>限額： 3000" class="limit">25K</button><button title="費用： 700<br/>限額： 2000" class="limit">13K</button><button title="費用： 400<br/>限額： 2000" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">臺南市南區公所/臺南市體育總會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="http://www.facebook.com/events/269352061924103">八百壯士超馬系列-制霸水沙漣超馬</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/16 日 05:00
                      </font></td><td><font color="Black">南投縣埔里鎮麒麟渡假山莊</font></td><td width="15%"><font color="Black">
                          <button title="費用：">101K</button><button title="費用：">49K</button>
                      </font></td><td width="15%"><font color="Black">TUR/臺灣龍虎鳳越野協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/TourismCup2022">2022 桃園市第二屆大觀盃海洋國際馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/16 日 06:00
                      </font></td><td><font color="Black">桃園市大園區桃園區漁會大樓前廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100">42.195K</button><button title="費用： 950">21K</button><button title="費用： 700">8K</button><button title="費用： 400">3.5K</button>
                      </font></td><td width="15%"><font color="Black">桃園市體育總會馬拉松委員會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5205#25227">運動i臺灣－2022宜蘭縣冬山河水岸馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/16 日 06:00
                      </font></td><td><font color="Black">宜蘭縣五結鄉冬山河親水公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000<br/>限額：共2000人" class="limit">42.195K</button><button title="費用： 900<br/>限額： 共2000人" class="limit">21K</button><button title="費用： 700<br/>限額： 1500" class="limit">10K</button><button title="費用： 200<br/>限額： 1500" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">宜蘭縣政府/宜蘭縣羅東鎮體育會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ibodygo.com.tw/EventTopic.aspx?n=1333">2022 Puli Power 埔里山城派對馬拉松-七勢回歸</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/16 日 06:00
                      </font></td><td><font color="Black">南投縣埔里鎮福興溫泉遊客中心</font></td><td width="15%"><font color="Black">
                          <button title="費用：1250<br/>限額：1500" class="limit">42.195K</button><button title="費用： 1050<br/>限額： 1500" class="limit">21K</button><button title="費用： 850<br/>限額： 1500" class="limit">12K</button><button title="費用： 400<br/>限額： 1500" class="limit">3.5K</button>
                      </font></td><td width="15%"><font color="Black">埔里鎮公所/南投縣觀光產業聯盟協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.sportsnet.org.tw/20221016_web/">高雄市第7屆舒跑杯</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/16 日 06:00
                      </font></td><td><font color="Black">高雄市前鎮區時代大道廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：100<br/>限額：8000" class="limit">9.7K</button><button title="費用： 100<br/>限額： 8000" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">維他露食品公司</font></td><td align="right" width="130"><font color="Black">
                          8月15日 ~ 9月15日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ctrun.com.tw/pageO.aspx?CF_ActCode=DX221120&amp;id=7009">2022 屏東馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/16 日 06:00
                      </font></td><td><font color="Black">屏東縣屏東市縣民公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：">42.195K</button><button title="費用：">21K</button><button title="費用：">11K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">屏東縣政府</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Sushi2021/">2021 壽司半程馬拉松(第三屆)-家以拾米(由2022/3/20延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/16 日 06:30
                      </font></td><td><font color="Black">雲林縣二崙鄉東遠碾米廠</font></td><td width="15%"><font color="Black">
                          <button title="費用：900<br/>限額：1000" class="limit">21K</button><button title="費用： 800<br/>限額： 1000" class="limit">10K</button><button title="費用： 600<br/>限額： 1000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">東遠碾米廠</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ibodygo.com.tw/EventTopic.aspx?n=1318">第八屆杉林溪森林健走暨林道定向越野賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/16 日 07:30
                      </font></td><td><font color="Black">南投縣竹山鎮杉林溪大飯店前廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：300" class="limit">18K</button><button title="費用： 1100">11K</button><button title="費用： 1100">7K</button><button title="費用： 1100">4K</button>
                      </font></td><td width="15%"><font color="Black">杉林溪森林生態渡假園區/杉林溪森林馬拉松俱樂部</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5308#25623">2022 年臺南全國鐵人三項錦標賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/16 日 08:00
                      </font></td><td><font color="Black">臺南市安平區觀夕平台</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：1000" class="limit">1.5K+40K+10K</button><button title="費用：<br/>限額： 800" class="limit">0.75K+20K+5K</button><button title="費用：<br/>限額： 300" class="limit">5K+20K+5K</button>
                      </font></td><td width="15%"><font color="Black">臺南市政府/中華民國鐵人三項運動協會</font></td><td align="right" width="130"><font color="Black">
                           ~ 9月10日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          2022 LET'S RUN 空英1919陪讀路跑
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/22 六
                      </font></td><td><font color="Black">新北市新店區碧潭東岸廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：">11K</button><button title="費用：">6K</button>
                      </font></td><td width="15%"><font color="Black">中華基督教救助協會/空中英語教室</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://reurl.cc/LM3KaK">2022 鄉鎮之美馬拉松-外埔場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/22 六 05:00
                      </font></td><td><font color="Black">大甲溪畔生態公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：">43K</button><button title="費用：">23.8K</button><button title="費用：">9.6K</button>
                      </font></td><td width="15%"><font color="Black">欣恩創意國際有限公司</font></td><td align="right" width="130"><font color="Black">
                          7月28日 ~ 10月08日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5099#24881">2022 低碳之旅「山河戀坪林馬拉松」路跑嘉年華（由2022/6/11延期）</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/22 六 06:30
                      </font></td><td><font color="Black">新北市坪林區坪林國中</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200">43K</button><button title="費用： 1000">22K</button><button title="費用： 800">10K</button><button title="費用： 600">5K</button>
                      </font></td><td width="15%"><font color="Black">榮耀九三運動協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/pacaficvalley2022">2022 花蓮太平洋縱谷馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/22 六 06:30
                      </font></td><td><font color="Black">花蓮縣花蓮市美崙田徑場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1150<br/>限額：550" class="limit">42.195K</button><button title="費用：1050<br/>限額：1650" class="limit">21K</button><button title="費用：950<br/>限額：1700" class="limit">10K</button><button title="費用：750<br/>限額：2800" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">花蓮縣花蓮市體育會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/4779#23397">OKRUN 2022 愛在南澳路跑活動</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/22 六 13:30
                      </font></td><td><font color="Black">宜蘭縣南澳鄉綜合運動場</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：800" class="limit">21K</button><button title="費用：<br/>限額： 1200" class="limit">5.5K</button>
                      </font></td><td width="15%"><font color="Black">南澳鄉公所/OK忠訓國際股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340" style="text-decoration:line-through;"><font color="Black">
                          *LAVA Xtrail 撒野墾丁越野嘉年華–越野跑*
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/23 日
                      </font></td><td><font color="Black">屏東縣恆春鎮墾丁路石牛巷1-1號</font></td><td width="15%"><font color="Black">
                          <button title="費用：">25K</button>
                      </font></td><td width="15%"><font color="Black">LAVA Sports 鐵人公司</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.evaairrun.com/?utm_campaign=202204_bzd_eva_air_run&amp;utm_source=tw_runnersquare&amp;utm_medium=foc_post&amp;utm_content=square0615post">2022 長榮航空城市觀光馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          <img src="/images/aims_logo.gif" alt="AIMS Course Certificate">
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/23 日 05:10
                      </font></td><td><font color="Black">臺北市中正區總統府前廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1800<br/>限額：4000" class="limit">42.195K</button><button title="費用： 1100<br/>限額： 8000" class="limit">21.0975K</button><button title="費用： 800<br/>限額： 8000" class="limit">10K</button><button title="費用： 500<br/>限額： 4000" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">長榮航空</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.joinnow.com.tw/about.php?cnt_id=31&amp;type=1">2022 年第七屆匠愛家園公益路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/23 日 06:00
                      </font></td><td><font color="Black">高雄市橋頭區橋頭國中</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000<br/>限額：350" class="limit">21K</button><button title="費用： 800<br/>限額： 350" class="limit">12K</button><button title="費用： 500<br/>限額： 350" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">社團法人高雄市生命源全人關懷協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/BlackBear2022/">2022 黑熊抵嘉半程馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/23 日 06:00
                      </font></td><td><font color="Black">嘉義縣番路鄉旺萊山愛情大草原</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000<br/>限額：1500" class="limit">21K</button><button title="費用： 900<br/>限額： 1000" class="limit">10K</button><button title="費用： 800<br/>限額： 500" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣路跑賽會服務協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lihi1.com/oI5Ai/runner">2022 成功三仙台馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/23 日 06:00
                      </font></td><td><font color="Black">臺東縣成功鎮海濱公園停車場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：350" class="limit">42.195K</button><button title="費用： 1000<br/>限額： 350" class="limit">21K</button><button title="費用： 800<br/>限額： 600" class="limit">10K</button><button title="費用： 600<br/>限額： 700" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">臺東縣成功鎮公所</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ctrun.com.tw/pageO.aspx?CF_ActCode=DU221023&amp;id=6962">2022 MAXWEL 馬索沃路跑趣-高雄場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/23 日 06:00
                      </font></td><td><font color="Black">高雄市鳥松區澄清湖棒球場前廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：">10K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣國際鐵人三項交流發展協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lihi1.com/BugGD/runner">2022 雲林149甲草嶺公路半程馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/23 日 06:00
                      </font></td><td><font color="Black">雲林縣古坑鄉舊樟湖國小</font></td><td width="15%"><font color="Black">
                          <button title="費用：">21K</button><button title="費用：">10K</button><button title="費用：">5K</button><button title="費用：">3K</button>
                      </font></td><td width="15%"><font color="Black">雲林縣國民中學體育促進會</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ibodygo.com.tw/EventTopic.aspx?n=1319">2022 為守護石虎而跑—聯大八甲馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/23 日 06:30
                      </font></td><td><font color="Black">苗栗縣苗栗市國立聯合大學八甲校區</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：900" class="limit">42.195K</button><button title="費用： 1000<br/>限額： 1200" class="limit">21K</button><button title="費用： 850<br/>限額： 1200" class="limit">10K</button><button title="費用： 550<br/>限額： 1000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">國立聯合大學暨校友總會/臺灣大腳丫長跑協會</font></td><td align="right" width="130"><font color="Black">
                          5月09日 ~ 9月16日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5083#24821">Fun3 sport | Force Kids 2022小鐵人挑戰賽(宜蘭站)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/23 日 08:00
                      </font></td><td><font color="Black">宜蘭縣宜蘭市國民運動中心</font></td><td width="15%"><font color="Black">
                          
                      </font></td><td width="15%"><font color="Black">瘋三鐵股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ibodygo.com.tw/EventTopic.aspx?n=1328">2022 梅山越野</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/29 六 03:00
                      </font></td><td><font color="Black">嘉義縣梅山鄉太平雲梯</font></td><td width="15%"><font color="Black">
                          <button title="費用：5100<br/>限額：50" class="limit">110K</button><button title="費用： 4100<br/>限額： 60" class="limit">75K</button><button title="費用： 2300<br/>限額： 150" class="limit">35K</button><button title="費用： 1700<br/>限額： 100" class="limit">15K</button>
                      </font></td><td width="15%"><font color="Black">TUR團隊</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://yilanmarathon.com.tw/">2022 杏輝宜蘭永續城鄉馬拉松(由2022/4/23延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/29 六 06:00
                      </font></td><td><font color="Black">宜蘭縣宜蘭市宜蘭運動公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100<br/>限額：1500" class="limit">42.195K</button><button title="費用： 950<br/>限額： 2500" class="limit">21K</button><button title="費用： 750<br/>限額： 2500" class="limit">10K</button><button title="費用： 500<br/>限額： 1500" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">宜蘭縣政府</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Yuandong2022/">2022 第十三屆遠東新世紀經典馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/29 六 06:00
                      </font></td><td><font color="Black">新竹縣新埔鎮遠東新世紀化纖總廠</font></td><td width="15%"><font color="Black">
                          <button title="費用：1390<br/>限額：800" class="limit">42.195K</button><button title="費用： 1190<br/>限額： 1800" class="limit">22K</button><button title="費用： 990<br/>限額： 1800" class="limit">9K</button><button title="費用： 890<br/>限額： 600" class="limit">6K</button>
                      </font></td><td width="15%"><font color="Black">FE遠東集團-FENC遠東新世紀股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5287#25520">2022 瘋啤酒-天母萬聖節雙人越野</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/29 六 13:00
                      </font></td><td><font color="Black">臺北市士林區芝山巖文化遺址展示館前</font></td><td width="15%"><font color="Black">
                          <button title="費用：">16K</button><button title="費用：">9K</button>
                      </font></td><td width="15%"><font color="Black">瘋啤酒健跑團/越野健跑團</font></td><td align="right" width="130"><font color="Black">
                           ~ 9月15日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/LetsRun2022/">2022 LET'S RUN 空英1919陪讀路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/29 六 15:00
                      </font></td><td><font color="Black">新北市新店區碧潭東岸廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：990<br/>限額：900" class="limit">11K</button><button title="費用： 790<br/>限額： 2600" class="limit">6K</button>
                      </font></td><td width="15%"><font color="Black">中華基督教救助協會/空中英語教室</font></td><td align="right" width="130"><font color="Black">
                           ~ 9月30日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340" style="text-decoration:line-through;"><font color="Black">
                          *第一屆信吉馬拉松X音樂路跑嘉年華*
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/30 日
                      </font></td><td><font color="Black">&nbsp;</font></td><td width="15%"><font color="Black">
                          <button title="費用：">21K</button><button title="費用：">8.2K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">信吉衛星電視台</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://goldmedal.run/819qaz">2022 高雄富邦馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          <img src="/images/aims_logo.gif" alt="AIMS Course Certificate">
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/30 日 05:30
                      </font></td><td><font color="Black">高雄市左營區國家體育場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1400<br/>限額：5000" class="limit">42.195K</button><button title="費用： 1200<br/>限額： 7000" class="limit">21K</button><button title="費用： 1000<br/>限額： 6000" class="limit">10K</button>
                      </font></td><td width="15%"><font color="Black">高雄市政府運動發展局</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/4776#23458">運動i臺灣地方特色運動-2022慢城山水馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/30 日 06:00
                      </font></td><td><font color="Black">苗栗縣南庄鄉公所河堤公有停車場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000">42.195K</button><button title="費用： 800">21K</button><button title="費用： 550">10K</button><button title="費用： 350">4K</button>
                      </font></td><td width="15%"><font color="Black">苗栗縣政府/南庄鄉公所</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/2022LobsangTaoyuan">2022 羅布森伴城路跑 拾孟桃-桃園站</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/30 日 06:00
                      </font></td><td><font color="Black">桃園市中壢區樂天桃園棒球場(文康路)</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100<br/>限額：1400" class="limit">21K</button><button title="費用： 900<br/>限額： 1800" class="limit">10K</button><button title="費用： 700<br/>限額： 1200" class="limit">3.5K</button><button title="費用： 700">公益組(免費)</button>
                      </font></td><td width="15%"><font color="Black">羅布森股份有限公司/運動筆記</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www1.cgmh.org.tw/intr/intr2/c0910/department/running5.htm">長庚紀念醫院2022永慶盃路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/30 日 06:00
                      </font></td><td><font color="Black">臺北市中正區總統府前廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：200<br/>限額：6000" class="limit">10.5K</button><button title="費用： 200<br/>限額： 15000" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">長庚醫療財團法人林口長庚紀念醫院/中華民國路跑協會</font></td><td align="right" width="130"><font color="Black">
                          7月15日 ~ 9月15日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Sanying2022/">2022 第六屆三鶯陶花源馬拉松公益路跑賽(由2022/7/17延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/30 日 06:20
                      </font></td><td><font color="Black">新北市鶯歌區三鶯陶花源公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：300" class="limit">30K</button><button title="費用： 1100<br/>限額： 300" class="limit">21K</button><button title="費用： 1000<br/>限額： 200" class="limit">10K</button><button title="費用： 800<br/>限額： 150" class="limit">6K</button>
                      </font></td><td width="15%"><font color="Black">新北市鐵人進化運動協會</font></td><td align="right" width="130"><font color="Black">
                          11月26日 ~ 9月15日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/sunmoonlakemarathon2022">2022 日月潭環湖馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          <img src="/images/aims_logo.gif" alt="AIMS Course Certificate">
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/30 日 06:30
                      </font></td><td><font color="Black">南投縣魚池鄉日月潭向山遊客中心</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：1000" class="limit">42.195K</button><button title="費用：<br/>限額： 3000" class="limit">29K</button><button title="費用：<br/>限額： 1000" class="limit">6K</button>
                      </font></td><td width="15%"><font color="Black">南投縣政府/中華運動生活協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://run.wellness.suntory.com.tw/">2022 三得利健益路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/30 日 06:30
                      </font></td><td><font color="Black">臺北市中山區大佳河濱公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：900<br/>限額：1000" class="limit">21.5K</button><button title="費用： 700<br/>限額： 1500" class="limit">10K</button><button title="費用： 500<br/>限額： 1500" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">中華民國路跑協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Dianqi2022/">2022 第八屆電器盃節能公益路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/30 日 06:45
                      </font></td><td><font color="Black">臺北市中山區美堤碼頭廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100">21K</button><button title="費用： 1000">10K</button><button title="費用： 800">5K</button>
                      </font></td><td width="15%"><font color="Black">臺北市電器商業同業公會</font></td><td align="right" width="130"><font color="Black">
                          7月01日 ~ 9月11日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5203#25267">臺北市『2022健康活力，運動臺北』貓空路跑、健步活動</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/30 日 07:30
                      </font></td><td><font color="Black">臺北市文山區政治大學運動場</font></td><td width="15%"><font color="Black">
                          <button title="費用：650<br/>限額：850" class="limit">21K</button><button title="費用： 650<br/>限額： 850" class="limit">10K</button><button title="費用： 400<br/>限額： 800" class="limit">4.5K</button><button title="費用： 0<br/>限額： 500" class="limit">接力組</button>
                      </font></td><td width="15%"><font color="Black">臺北市文山休閒運動推廣協會/臺北市文山區政大里辦公處</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class="splitline" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <span id="monthtag">11月</span><img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/QingshuiCarnaval2022/">2022 清水馬拉松嘉年華會</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/05 六 06:00
                      </font></td><td><font color="Black">臺中市清水區紫雲巖廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100<br/>限額：1000" class="limit">42.195K</button><button title="費用： 900<br/>限額： 1000" class="limit">21K</button><button title="費用： 650<br/>限額： 1500" class="limit">12K</button><button title="費用： 450<br/>限額： 1500" class="limit">4K</button>
                      </font></td><td width="15%"><font color="Black">議長張清照服務處/清水紫雲巖管理委員會</font></td><td align="right" width="130"><font color="Black">
                          3月25日 ~ 9月30日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://su82820587.pixnet.net/blog">2022 如來神掌100式</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/05 六 06:00
                      </font></td><td><font color="Black">新北市淡水區賢孝社區公園 </font></td><td width="15%"><font color="Black">
                          <button title="費用：2825<br/>限額：共300人" class="limit">100K</button><button title="費用： 2825<br/>限額： 共300人" class="limit">84K</button><button title="費用： 2825<br/>限額： 共300人" class="limit">69K</button><button title="費用： 2125<br/>限額： 共300人" class="limit">50K</button>
                      </font></td><td width="15%"><font color="Black">新北超馬團隊</font></td><td align="right" width="130"><font color="Black">
                          4月01日 ~ 
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://goldmedal.run/915hjl">2022 日出迎新 為愛兒跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/05 六 06:00
                      </font></td><td><font color="Black">新竹縣竹北市六角國際全球營運總部大樓</font></td><td width="15%"><font color="Black">
                          <button title="費用：900<br/>限額：1000" class="limit">15K</button><button title="費用： 750<br/>限額： 2000" class="limit">6K</button><button title="費用： 600<br/>限額： 1500" class="limit">2K</button>
                      </font></td><td width="15%"><font color="Black">六角國際事業股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          7月04日 ~ 9月15日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5332#25772">第七屆馬祖馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/05 六 06:30
                      </font></td><td><font color="Black">連江縣南竿鄉福澳運動場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：800" class="limit">42.195K</button><button title="費用： 1000<br/>限額： 900" class="limit">21K</button><button title="費用： 800<br/>限額： 800" class="limit">10K</button>
                      </font></td><td width="15%"><font color="Black">連江縣政府/交通部觀光局馬祖國家風景區管理處</font></td><td align="right" width="130"><font color="Black">
                          8月16日 ~ 9月26日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5268#25567">2022 彩虹四季運動觀光系列活動－屏東墾丁山海馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/06 日 06:00
                      </font></td><td><font color="Black">屏東縣恆春鎮墾丁大灣遊憩區</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：500" class="limit">42.2K</button><button title="費用： 1000<br/>限額： 500" class="limit">21.1K</button><button title="費用： 800<br/>限額： 700" class="limit">10K</button><button title="費用： 400<br/>限額： 300" class="limit">2.5K</button>
                      </font></td><td width="15%"><font color="Black">屏東縣政府/LAVA Sports臺灣鐵人三項公司</font></td><td align="right" width="130"><font color="Black">
                          7月11日 ~ 9月16日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.focusline.com.tw/11113FA/Activities/Activities.aspx?Page=Txt201706221532139638_ran">2022 國苗盟路跑嘉年華</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/06 日 06:00
                      </font></td><td><font color="Black">桃園市桃園區桃園田徑場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1300<br/>限額：共8000人" class="limit">21K</button><button title="費用： 1100<br/>限額： 共8000人" class="limit">10K</button><button title="費用： 800<br/>限額： 共8000人" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">國家護苗聯盟</font></td><td align="right" width="130"><font color="Black">
                          7月12日 ~ 10月03日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Sanchong2022/">2022 三重全國馬拉松賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/06 日 06:00
                      </font></td><td><font color="Black">新北市三重區重陽橋下廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200">42.195K</button><button title="費用： 1000">21K</button><button title="費用： 800">10K</button><button title="費用： 150">2K</button>
                      </font></td><td width="15%"><font color="Black">新北市三重區體育會</font></td><td align="right" width="130"><font color="Black">
                          5月06日 ~ 9月18日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.eventpal.com.tw/FOAS/actions/ActivityIndex.action?showTabContent&amp;seqno=6e099af0-40bd-42aa-b0d0-52815260614c">2022 西螺媽祖太平媽祈福馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/06 日 06:00
                      </font></td><td><font color="Black">雲林縣西螺福興宮廟前廣場(延平老街)</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000<br/>限額：1000" class="limit">21K</button><button title="費用： 800<br/>限額： 1000" class="limit">10K</button><button title="費用： 500<br/>限額： 1000" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">財團法人雲林縣西螺福興宮</font></td><td align="right" width="130"><font color="Black">
                          8月08日 ~ 10月12日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bonnygo.com.tw/tw/battle/intro.aspx?num=266&amp;kind=1">2022 年中埔鄉甕窯雞全國公益馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/06 日 06:30
                      </font></td><td><font color="Black">嘉義縣中埔鄉中埔國中</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：300" class="limit">23K</button><button title="費用：<br/>限額： 200" class="limit">10K</button><button title="費用：<br/>限額： 300" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">中華民國青少年體育協會</font></td><td align="right" width="130"><font color="Black">
                          5月01日 ~ 9月20日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="http://t.ly/dmU0">2022 戀戀二水 跑水馬拉松  </a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/06 日 06:30
                      </font></td><td><font color="Black">彰化縣二水鄉二水國民小學</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100<br/>限額：2500" class="limit">21.4K</button><button title="費用： 900<br/>限額： 2500" class="limit">11.4K</button>
                      </font></td><td width="15%"><font color="Black">彰化縣文化局/二水鄉公所</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/4981#24212">跑吧！孩子2022知本溫泉公益馬拉松(由2022/2/13延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/06 日 06:30
                      </font></td><td><font color="Black">臺東縣卑南鄉溫泉國民小學</font></td><td width="15%"><font color="Black">
                          <button title="費用：1300<br/>限額：共1500人" class="limit">42.195K</button><button title="費用： 1100<br/>限額： 共1500人" class="limit">23K</button><button title="費用： 900<br/>限額： 共1500人" class="limit">10K</button><button title="費用： 700<br/>限額： 共1500人" class="limit">6K</button>
                      </font></td><td width="15%"><font color="Black">知本老爺酒店/臺東縣卑南鄉公所</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ctrun.com.tw/pageO.aspx?CF_ActCode=DV221106&amp;id=6978">2022 MAXWEL 馬索沃路跑趣-彰化場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/06 日 06:30
                      </font></td><td><font color="Black">彰化縣溪州鄉溪州公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：">11K</button><button title="費用：">4K</button>
                      </font></td><td width="15%"><font color="Black">臺灣國際鐵人三項交流發展協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/PowerInRun202101/">2022 POWER IN RUN 高雄路跑賽(由2021/10/24延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/06 日 07:00
                      </font></td><td><font color="Black">高雄市前鎮區夢時代前廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：共5000人" class="limit">10K</button><button title="費用：<br/>限額： 共5000人" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">臺南市紅瓦厝長跑協會</font></td><td align="right" width="130"><font color="Black">
                          9月11日 ~ 9月18日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/4873#23749">2022 菊島澎湖跨海馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/06 日 07:00
                      </font></td><td><font color="Black">澎湖縣西嶼鄉西台遊客中心</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：800" class="limit">42.195K</button><button title="費用： 1000<br/>限額： 1000" class="limit">21K</button><button title="費用： 500<br/>限額： 700" class="limit">5K</button><button title="費用： 4000<br/>限額： 75隊" class="limit">42K接力</button>
                      </font></td><td width="15%"><font color="Black">交通部觀光局澎湖國家風景區管理處</font></td><td align="right" width="130"><font color="Black">
                           ~ 9月30日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5302#25584">2022 北埔膨風路跑活動</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/12 六 06:00
                      </font></td><td><font color="Black">新竹縣北埔鄉綠世界生態農場</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：400" class="limit">21K</button><button title="費用：<br/>限額： 500" class="limit">11K</button><button title="費用：<br/>限額： 600" class="limit">5.5K</button>
                      </font></td><td width="15%"><font color="Black">北埔鄉公所/臺灣大車隊股份有限公司</font></td><td align="right" width="130"><font color="Black">
                           ~ 10月08日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.facebook.com/events/981507269432368">八百壯士超馬系列-制霸環化100mile超馬</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/12 六 08:00
                      </font></td><td><font color="Black">彰化縣花壇鄉文德宮</font></td><td width="15%"><font color="Black">
                          <button title="費用：">160K</button>
                      </font></td><td width="15%"><font color="Black">TUR/臺灣龍虎鳳越野協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://opcc.work/TPERUN1">2022 臺北城市創意路跑 TPERUN (由2022/8/21延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/13 日 06:00
                      </font></td><td><font color="Black">臺北市中正區總統府前廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000<br/>限額：6000" class="limit">12.5K</button><button title="費用： 600<br/>限額： 8000" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">創意實踐家企業有限公司/臺灣路跑運動協會</font></td><td align="right" width="130"><font color="Black">
                          7月25日 ~ 9月22日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Enzyme2021/">2022 歡酵盃路跑嘉年華</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/13 日 06:00
                      </font></td><td><font color="Black">嘉義縣六腳鄉蒜頭糖廠</font></td><td width="15%"><font color="Black">
                          <button title="費用：900<br/>限額：1000" class="limit">21K</button><button title="費用： 800<br/>限額： 1000" class="limit">10K</button><button title="費用： 700<br/>限額： 1000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣酵素村股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          4月01日 ~ 9月30日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          臺中舒跑杯
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/13 日 06:00
                      </font></td><td><font color="Black">臺中市西屯區臺灣大道市政廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：100">9K</button><button title="費用： 100">3K</button>
                      </font></td><td width="15%"><font color="Black">維他露食品股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://pse.is/4aj73k">2022 ZEPRO RUN 全國半程馬拉松路跑-臺南場賽事</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/13 日 06:00
                      </font></td><td><font color="Black">臺南市安平區戀愛廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：">21K</button><button title="費用：">10K</button><button title="費用：">3.5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣國際鐵人三項交流發展協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/Tianzhong2022/signu">2022 臺灣米倉田中馬拉松 </a>
                      </font></td><td align="right" width="5"><font color="Black">
                          <img src="/images/aims_logo.gif" alt="AIMS Course Certificate">
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/13 日 06:20
                      </font></td><td><font color="Black">彰化縣田中鎮景崧文化教育園區</font></td><td width="15%"><font color="Black">
                          <button title="費用：1400<br/>限額：4000" class="limit">42.195K</button><button title="費用： 1200<br/>限額： 6000" class="limit">22.6K</button><button title="費用： 1000<br/>限額： 6500" class="limit">9.7K</button>
                      </font></td><td width="15%"><font color="Black">彰化縣政府/舒康運動協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Banqiao2022/">2022 板橋馬拉松路跑賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/13 日 06:30
                      </font></td><td><font color="Black">新北市板橋區浮洲橋下堤外自行車道</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100<br/>限額：1500" class="limit">42.195K</button><button title="費用： 900<br/>限額： 1500" class="limit">21K</button><button title="費用： 800<br/>限額： 1500" class="limit">10K</button><button title="費用： 600<br/>限額： 1500" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">新北市板橋區公所/新北市越野長跑協會</font></td><td align="right" width="130"><font color="Black">
                          4月01日 ~ 9月10日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="http://www.ctau.org.tw/news/2022-11-18-19-%e5%ae%9c%e8%98%ad%e5%86%ac%e5%b1%b1%e6%b2%b3%e8%b6%85%e7%b4%9a%e9%a6%ac%e6%8b%89%e6%9d%be/">2022 宜蘭冬山河超級馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/18 五 21:00
                      </font></td><td><font color="Black">宜蘭縣五結鄉親水公園大客車停車場</font></td><td width="15%"><font color="Black">
                          <button title="費用：">100miles</button><button title="費用：">100K</button><button title="費用：">50miles</button><button title="費用：">50K</button><button title="費用：">42.195K</button><button title="費用：">21K</button><button title="費用：">10K</button>
                      </font></td><td width="15%"><font color="Black">社團法人中華民國超級馬拉松運動協會</font></td><td align="right" width="130"><font color="Black">
                           ~ 10月17日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="http://www.formosatrail.com/">福爾摩沙古道</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/19 六 04:00
                      </font></td><td><font color="Black">南投縣埔里鎮天水蓮大飯店</font></td><td width="15%"><font color="Black">
                          <button title="費用：">104K</button><button title="費用：">75K</button><button title="費用：">40K</button><button title="費用：">16K</button><button title="費用：">8K</button>
                      </font></td><td width="15%"><font color="Black">臺灣跑山獸</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ibodygo.com.tw/EventTopic.aspx?n=1337">2022 第五屆臺中資訊盃公益馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/19 六 06:00
                      </font></td><td><font color="Black">臺中市烏日區臺中國際展覽館</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：900" class="limit">42.195K</button><button title="費用： 1000<br/>限額： 1800" class="limit">21K</button><button title="費用： 850<br/>限額： 1800" class="limit">9.8K</button><button title="費用： 650<br/>限額： 300" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">臺中市電腦商業同業公會/臺灣大腳丫長跑協會</font></td><td align="right" width="130"><font color="Black">
                          7月01日 ~ 9月30日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5328#25725">LAVA Xtrail 福隆站-越野跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/19 六 08:00
                      </font></td><td><font color="Black">新北市貢寮區福容大飯店</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：250" class="limit">20K</button><button title="費用：<br/>限額： 250" class="limit">9K</button><button title="費用：<br/>限額： 100" class="limit">1.5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣耐力運動協會/LAVA Sports 臺灣鐵人三項公司</font></td><td align="right" width="130"><font color="Black">
                          8月03日 ~ 9月30日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5197#25182">2022 SUPERACE 黑馬半程馬拉松 </a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/19 六 16:00
                      </font></td><td><font color="Black">臺北市中山區大佳河濱公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：1180<br/>限額：1500" class="limit">21K</button><button title="費用： 980<br/>限額： 1500" class="limit">14K</button><button title="費用： 680<br/>限額： 1000" class="limit">4.5K</button>
                      </font></td><td width="15%"><font color="Black">SUPERACE/社團法人臺灣體育運動競技協會</font></td><td align="right" width="130"><font color="Black">
                          5月02日 ~ 10月18日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ctrun.com.tw/pageO.aspx?CF_ActCode=ED221119&amp;id=7096">公勝30時尚野餐FUN夜跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/19 六 17:00
                      </font></td><td><font color="Black">新北市三重區新北大都會公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：900">10K</button><button title="費用： 800">4K</button>
                      </font></td><td width="15%"><font color="Black">公勝保險經紀人股份有限公司/全統運動用品股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          8月05日 ~ 9月12日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5054#24506">2022 府城超級馬拉松(由2022/3/26延期）</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/19 六 18:00
                      </font></td><td><font color="Black">臺南市安平區億載金城大門口</font></td><td width="15%"><font color="Black">
                          <button title="費用：2150<br/>限額：150" class="limit">12H</button><button title="費用： 1250<br/>限額： 350" class="limit">6H</button><button title="費用： 950<br/>限額： 300" class="limit">3H</button><button title="費用： 750<br/>限額： 300" class="limit">1H</button>
                      </font></td><td width="15%"><font color="Black">百事樂運動行銷整合有限公司</font></td><td align="right" width="130"><font color="Black">
                          12月03日 ~ 10月20日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          2022 MIZUNO 馬拉松接力賽
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/20 日
                      </font></td><td><font color="Black">新北市金山區青年活動中心</font></td><td width="15%"><font color="Black">
                          <button title="費用：">42.195K</button>
                      </font></td><td width="15%"><font color="Black">新北市體育總會/台灣美津濃股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340" style="text-decoration:line-through;"><font color="Black">
                          *2022 跑出金虎爺全國路跑賽*
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/20 日
                      </font></td><td><font color="Black">嘉義縣新港鄉奉天宮</font></td><td width="15%"><font color="Black">
                          <button title="費用：">12.5K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">財團法人嘉義縣新港奉天宮</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340" style="text-decoration:line-through;"><font color="Black">
                          *2022 鹿港馬拉松*
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/20 日
                      </font></td><td><font color="Black">彰化縣鹿港鎮</font></td><td width="15%"><font color="Black">
                          <button title="費用：">42.195K</button><button title="費用：">21K</button><button title="費用：">10K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">&nbsp;</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Lionclub2022/">國際獅子會健康愛嘉半程馬拉松-(300D1區2022-2023)(由2022/9/18延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/20 日 06:00
                      </font></td><td><font color="Black">嘉義市體育路嘉義市田徑場</font></td><td width="15%"><font color="Black">
                          <button title="費用：950<br/>限額：1000" class="limit">21K</button><button title="費用： 850<br/>限額： 1000" class="limit">10K</button><button title="費用： 750<br/>限額： 1000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">樂活資訊服務股份有限公司/國際獅子會300D1區</font></td><td align="right" width="130"><font color="Black">
                          4月18日 ~ 10月02日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          第一屆林口竹林山觀音寺祈福路跑 
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/20 日 06:00
                      </font></td><td><font color="Black">新北市林口區竹林山觀音寺</font></td><td width="15%"><font color="Black">
                          <button title="費用：">10K</button><button title="費用：">4K</button>
                      </font></td><td width="15%"><font color="Black">新北市愛跑者協會/林口體育會</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5325#25721">LAVA Xtrail 福隆站-公路越野鐵人三項 / 兩項</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/20 日 06:30
                      </font></td><td><font color="Black">新北市貢寮區福隆海水浴場</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：300" class="limit">1.5K+36K+10K</button><button title="費用：<br/>限額： 200" class="limit">2K+36K+10K</button>
                      </font></td><td width="15%"><font color="Black">臺灣耐力運動協會/LAVA Sports 臺灣鐵人三項公司</font></td><td align="right" width="130"><font color="Black">
                          8月03日 ~ 9月30日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5182#25164">2022 阿公店盃全國馬拉松賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/20 日 06:30
                      </font></td><td><font color="Black">高雄市高岡山區醒村文化景觀公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：1000" class="limit">42.195K</button><button title="費用：<br/>限額： 1000" class="limit">24K</button><button title="費用：<br/>限額： 1000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">高雄市阿公店長跑協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.facebook.com/CrufuRun/">CRUFU RUN 夸父追日跨夜接力賽-金門站</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/26 六
                      </font></td><td><font color="Black">金門縣金沙鎮林務所</font></td><td width="15%"><font color="Black">
                          <button title="費用：">120K</button><button title="費用：">61K</button>
                      </font></td><td width="15%"><font color="Black">中華健康生活運動保健協會/司格特國際運動行銷有限公司</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340" style="text-decoration:line-through;"><font color="Black">
                          *2022 臺灣健士路跑賽--虎躍龜丹噍吧哖*
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/27 日
                      </font></td><td><font color="Black">臺南市玉井區綜合體育館</font></td><td width="15%"><font color="Black">
                          <button title="費用：">23K</button><button title="費用：">10K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣健士體育暨文化公益信託/臺南市鐵南人運動協會</font></td><td align="right" width="130"><font color="Black">
                          7月13日 ~ 9月30日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://reurl.cc/xQOnbZ">2022 鄉鎮之美馬拉松-彰化溪州場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/27 日 05:00
                      </font></td><td><font color="Black">彰化縣溪州鄉覆靈宮</font></td><td width="15%"><font color="Black">
                          <button title="費用：">43.2K</button><button title="費用：">21.6</button><button title="費用：">10.8K</button>
                      </font></td><td width="15%"><font color="Black">欣恩創意國際有限公司</font></td><td align="right" width="130"><font color="Black">
                          8月11日 ~ 11月12日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5298#25592">2022  Liv LAVA Queen 臺北女子二鐵賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/27 日 06:00
                      </font></td><td><font color="Black">臺北市中山區美堤河濱公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：500組" class="limit">3K+20K+5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣耐力運動協會/LAVA Sports臺灣鐵人三項公司</font></td><td align="right" width="130"><font color="Black">
                          7月13日 ~ 9月23日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          2022 三商盃公益路跑
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/27 日 06:30
                      </font></td><td><font color="Black">臺北市中山區大佳河濱公園(巨蛋廣場)</font></td><td width="15%"><font color="Black">
                          <button title="費用：">21K</button><button title="費用：">10K</button><button title="費用：">4K</button>
                      </font></td><td width="15%"><font color="Black">三商家購股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          8月01日 ~ 10月14日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/SouthNPM2022/">2022 第四屆故宮南院馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/27 日 06:30
                      </font></td><td><font color="Black">嘉義縣太保市國立故宮博物院南部院區北側慶典花園旁</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100<br/>限額：1000" class="limit">42.195K</button><button title="費用： 900<br/>限額： 1000" class="limit">21K</button><button title="費用： 800<br/>限額： 1000" class="limit">12K</button><button title="費用： 700<br/>限額： 1000" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">臺灣路跑賽會服務協會</font></td><td align="right" width="130"><font color="Black">
                          7月14日 ~ 9月30日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ibodygo.com.tw/EventTopic.aspx?n=1329">2022 第七屆南投馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/27 日 06:30
                      </font></td><td><font color="Black">南投縣南投市中興新村</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：1500" class="limit">42.195K</button><button title="費用： 1000<br/>限額： 2000" class="limit">22.5K</button><button title="費用： 800<br/>限額： 1500" class="limit">10K</button><button title="費用： 600<br/>限額： 1500" class="limit">4.5K</button>
                      </font></td><td width="15%"><font color="Black">南投縣馬拉松協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class="splitline" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <span id="monthtag">12月</span>
                      </font></td><td width="340"><font color="Black">
                          2022 彩虹四季運動觀光系列活動－大鵬灣星光路跑
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/03 六
                      </font></td><td><font color="Black">屏東縣東港鎮大鵬灣國際休閒特區</font></td><td width="15%"><font color="Black">
                          <button title="費用：">21.1K</button><button title="費用：">13K</button><button title="費用：">4K</button>
                      </font></td><td width="15%"><font color="Black">屏東縣政府</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/jiaoxihotspring2022">2022 礁溪溫泉馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/03 六 06:15
                      </font></td><td><font color="Black">宜蘭縣礁溪鄉礁溪國小</font></td><td width="15%"><font color="Black">
                          <button title="費用：1300<br/>限額：1500" class="limit">42.195K</button><button title="費用： 1100<br/>限額： 1500" class="limit">21.5K</button><button title="費用： 700<br/>限額： 1200" class="limit">6.35K</button>
                      </font></td><td width="15%"><font color="Black">宜蘭縣礁溪鄉公所/宜蘭縣礁溪鄉民代表會</font></td><td align="right" width="130"><font color="Black">
                          7月01日 ~ 9月26日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://pse.is/4ammr2?fbclid=IwAR00qHE6YV56SCI3CVEQ8WGPPUd3Hpc-xpe1ulAfkilHdmoxr3JPOt3yVX0">2022 桃園半程馬拉松 石門水庫楓半馬</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/03 六 06:30
                      </font></td><td><font color="Black">桃園市大溪區石門水庫南苑停車場</font></td><td width="15%"><font color="Black">
                          <button title="費用：700<br/>限額：1200" class="limit">21K</button><button title="費用： 500<br/>限額： 4800" class="limit">7K</button>
                      </font></td><td width="15%"><font color="Black">桃園市政府體育局</font></td><td align="right" width="130"><font color="Black">
                          6月28日 ~ 9月12日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5299#25658">2022 LAVAKIDS 大鵬灣小鐵人賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/03 六 10:00
                      </font></td><td><font color="Black">屏東縣東港鎮大鵬灣濱灣碼頭</font></td><td width="15%"><font color="Black">
                          <button title="費用：1135<br/>限額：100" class="limit">0.2K+5K+2K</button><button title="費用： 1135<br/>限額： 100" class="limit">0.1K+5K+1.2K</button>
                      </font></td><td width="15%"><font color="Black">LAVA Sports 臺灣鐵人三項公司</font></td><td align="right" width="130"><font color="Black">
                          7月18日 ~ 10月16日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          財政部111年統一發票盃暨國民法官新制路跑活動
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/04 日
                      </font></td><td><font color="Black">臺南市政府永華市政中心西拉雅廣場及西側廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：400<br/>限額：6000" class="limit">21K</button><button title="費用： 200<br/>限額： 6000" class="limit">12K</button><button title="費用： 0(捐贈3張紙本或雲端發票)<br/>限額： 8000" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">財政部南區國稅局/合作金庫銀行</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ibodygo.com.tw/EventTopic.aspx?n=1335">第八屆美濃水圳超級馬拉松賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/04 日 05:00
                      </font></td><td><font color="Black">高雄市美濃區龍肚小學</font></td><td width="15%"><font color="Black">
                          <button title="費用：1600<br/>限額：300" class="limit">45K</button>
                      </font></td><td width="15%"><font color="Black">高雄市美濃區獅山社區發展協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5199#25255">2022 『我是你的眼』視障公益路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/04 日 06:00
                      </font></td><td><font color="Black">高雄市鼓山區大榮中學</font></td><td width="15%"><font color="Black">
                          <button title="費用：1050<br/>限額：800" class="limit">21K</button><button title="費用： 900<br/>限額： 700" class="limit">10K</button><button title="費用： 750<br/>限額： 600" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">高雄市馬拉松協進會/高雄市政府運動發展局</font></td><td align="right" width="130"><font color="Black">
                          5月13日 ~ 10月10日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Polio2022/">第九屆伯立歐蕎麥公益路跑 Polio Run 為愛而跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/04 日 06:30
                      </font></td><td><font color="Black">彰化縣二林鎮國立二林工商</font></td><td width="15%"><font color="Black">
                          <button title="費用：850<br/>限額：1000" class="limit">21K</button><button title="費用： 750<br/>限額： 1000" class="limit">11K</button><button title="費用： 650<br/>限額： 2000" class="limit">7K</button>
                      </font></td><td width="15%"><font color="Black">小兒麻痺協會/伯立歐</font></td><td align="right" width="130"><font color="Black">
                          7月21日 ~ 9月20日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.focusline.com.tw/21204UW/Activities/Activities.aspx?Page=Txt202204211402225713_ran&amp;utm_source=focuslinefb&amp;utm_campaign=Sports&amp;utm_medium=post&amp;utm_term=2022%E3%80%81%E5%8F%B0%E7%B3%96%E3%80%81%E5%85%AC%E7%9B%8A%E8%B7%AF%E8%B7%91">2022 台糖公益路跑-愛在飛揚 有你隨行</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/04 日 06:30
                      </font></td><td><font color="Black">嘉義縣六腳鄉蒜頭糖廠蔗埕文化園區</font></td><td width="15%"><font color="Black">
                          <button title="費用：900">21.5K</button><button title="費用： 700">13.5K</button><button title="費用： 500">5K</button>
                      </font></td><td width="15%"><font color="Black">台灣糖業股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          7月08日 ~ 9月30日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5196#25172">2022 三星安農溪馬拉松嘉年華</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/04 日 06:30
                      </font></td><td><font color="Black">宜蘭縣三星鄉綜合運動場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1000<br/>限額：600" class="limit">42.195K</button><button title="費用： 800<br/>限額： 800" class="limit">21K</button><button title="費用： 600<br/>限額： 800" class="limit">10K</button><button title="費用： 300<br/>限額： 800" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">宜蘭縣三星鄉公所</font></td><td align="right" width="130"><font color="Black">
                          5月04日 ~ 9月29日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Huma2022/">2022 虎馬第四屆全國烤雞馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/04 日 06:30
                      </font></td><td><font color="Black">雲林縣虎尾鎮建成路與站前東路交叉路口</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100<br/>限額：3000" class="limit">42.195K</button><button title="費用： 1000<br/>限額： 3000" class="limit">21K</button><button title="費用： 800<br/>限額： 2000" class="limit">10K</button><button title="費用： 700<br/>限額： 2000" class="limit">6K</button>
                      </font></td><td width="15%"><font color="Black">雲林縣虎馬路跑協會/樂活資訊服務股份有限公司</font></td><td align="right" width="130"><font color="Black">
                          7月13日 ~ 9月30日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ctrun.com.tw/pageO.aspx?CF_ActCode=EA221204&amp;id=7035">2022 ZEPRO RUN 全國半程馬拉松路跑-臺中場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/04 日 06:30
                      </font></td><td><font color="Black">臺中市豐原區豐原體育場</font></td><td width="15%"><font color="Black">
                          <button title="費用：">21K</button><button title="費用：">11K</button><button title="費用：">6K</button>
                      </font></td><td width="15%"><font color="Black">臺灣國際鐵人三項交流發展協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5300">2022 富邦金控 LAVA TRI大鵬灣鐵人賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/04 日 06:50
                      </font></td><td><font color="Black">屏東縣東港鎮大鵬灣濱灣碼頭</font></td><td width="15%"><font color="Black">
                          <button title="費用：">0.3K+40K+10K</button><button title="費用：">1.5K+40K+10K</button><button title="費用：">3K+40K+10K</button>
                      </font></td><td width="15%"><font color="Black">LAVA Sports 臺灣鐵人三項公司</font></td><td align="right" width="130"><font color="Black">
                          7月18日 ~ 10月16日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.focusline.com.tw/21210YP/Activities/Activities.aspx?utm_source=focuslinefb&amp;utm_medium=system&amp;utm_campaign=Sports">2022 北港媽祖盃全國馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/10 六 06:00
                      </font></td><td><font color="Black">雲林縣北港鎮民主路1號</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：共10000人" class="limit">42.195K</button><button title="費用： 1000<br/>限額： 共10000人" class="limit">21K</button><button title="費用： 850<br/>限額： 共10000人" class="limit">10K</button><button title="費用： 500<br/>限額： 共10000人" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">財團法人北港朝天宮</font></td><td align="right" width="130"><font color="Black">
                          7月22日 ~ 10月20日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/taroko2022">2022 雲朗觀光太魯閣峽谷馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/10 六 06:40
                      </font></td><td><font color="Black">花蓮縣秀林鄉太魯閣國家公園管理處</font></td><td width="15%"><font color="Black">
                          <button title="費用：1400<br/>限額：3500" class="limit">42.195K</button><button title="費用： 1200<br/>限額： 5000" class="limit">21K</button><button title="費用： 1100<br/>限額： 3500" class="limit">12K</button>
                      </font></td><td width="15%"><font color="Black">花蓮縣體育會/花蓮縣馬拉松路跑協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5265#25670">ADA慈善路跑麗寶樂園嘉年華</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/10 六 13:30
                      </font></td><td><font color="Black">臺中市后里區麗寶樂園度假區</font></td><td width="15%"><font color="Black">
                          <button title="費用：1280<br/>限額：3000" class="limit">10K</button><button title="費用： 1280<br/>限額： 3000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">ADA臺北市建築世代會</font></td><td align="right" width="130"><font color="Black">
                          7月01日 ~ 10月31日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340" style="text-decoration:line-through;"><font color="Black">
                          *2022 第11屆晨曦麥香馬拉松*
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/11 日
                      </font></td><td><font color="Black">臺中市</font></td><td width="15%"><font color="Black">
                          
                      </font></td><td width="15%"><font color="Black">&nbsp;</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/2022GAUSHU">2022 屏東高樹蜜鄉馬拉松(由2022/5/1延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/11 日 05:30
                      </font></td><td><font color="Black">屏東縣高樹鄉高樹國中</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：1500" class="limit">42.195K</button><button title="費用： 1080<br/>限額： 2000" class="limit">23K</button><button title="費用： 950<br/>限額： 3000" class="limit">12K</button><button title="費用： 600<br/>限額： 2500" class="limit">10K</button><button title="費用： 500<br/>限額： 2500" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">屏東縣高樹鄉公所/創意實踐家企業有限公司</font></td><td align="right" width="130"><font color="Black">
                          6月01日 ~ 9月30日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/2022LobsangKaohsiung">2022 羅布森伴城路跑 拾貳臘港-高雄站</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/11 日 06:00
                      </font></td><td><font color="Black">高雄市前鎮區時代大道(83期市地重劃區)</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100<br/>限額：1400" class="limit">21K</button><button title="費用： 900<br/>限額： 1800" class="limit">10K</button><button title="費用： 700<br/>限額： 1200" class="limit">5K</button><button title="費用： 700">公益組(免費)</button>
                      </font></td><td width="15%"><font color="Black">羅布森股份有限公司/運動筆記</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/ChiayiBand2022/">「大吉」 2022第六屆嘉義馬拉松-國際管樂公益路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/11 日 06:20
                      </font></td><td><font color="Black">嘉義市民生國中</font></td><td width="15%"><font color="Black">
                          <button title="費用：900<br/>限額：3000" class="limit">42.195K</button><button title="費用： 800<br/>限額： 3000" class="limit">21K</button><button title="費用： 700<br/>限額： 2000" class="limit">10K</button><button title="費用： 600<br/>限額： 2000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">嘉義市體育運動總會</font></td><td align="right" width="130"><font color="Black">
                          8月15日 ~ 9月30日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5327#25859">2022 漫跑宜蘭休閒農業區-雙龍半程馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/11 日 06:30
                      </font></td><td><font color="Black">宜蘭縣礁溪鄉龍潭湖風景區</font></td><td width="15%"><font color="Black">
                          <button title="費用：1050<br/>限額：300" class="limit">21K</button><button title="費用： 950<br/>限額： 300" class="limit">11K</button><button title="費用： 850<br/>限額： 400" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">宜蘭縣農會</font></td><td align="right" width="130"><font color="Black">
                          8月31日 ~ 11月10日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ctrun.com.tw/pageO.aspx?CF_ActCode=EB221211&amp;id=7054">2022 MAXWEL 馬索沃路跑趣-桃園場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/11 日 06:30
                      </font></td><td><font color="Black">桃園市大溪區河濱公園(中庄調整池景觀土丘)</font></td><td width="15%"><font color="Black">
                          <button title="費用：">10K</button><button title="費用：">4K</button>
                      </font></td><td width="15%"><font color="Black">臺灣國際鐵人三項交流發展協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Tongxiao2022/">2022 通霄濱海追風馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/11 日 06:30
                      </font></td><td><font color="Black">苗栗縣通霄鎮通霄海水浴場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：3000" class="limit">42.195K</button><button title="費用： 1000<br/>限額： 3000" class="limit">23K</button><button title="費用： 900<br/>限額： 3000" class="limit">12K</button><button title="費用： 600<br/>限額： 3000" class="limit">4.5K</button>
                      </font></td><td width="15%"><font color="Black">苗栗縣政府/苗栗縣通霄慢跑協會</font></td><td align="right" width="130"><font color="Black">
                          8月02日 ~ 10月31日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5314#25736">2022 第39屆曾文水庫馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          <img src="/images/aims_logo.gif" alt="AIMS Course Certificate">
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/11 日 07:00
                      </font></td><td><font color="Black">臺南市楠西區南區水資源局曾文水庫</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100<br/>限額：1500" class="limit">42.195K</button><button title="費用： 900<br/>限額： 1500" class="limit">21.3K</button><button title="費用： 800<br/>限額： 2000" class="limit">12K</button><button title="費用： 500<br/>限額： 1000" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">臺南市政府/中華民國田徑協會</font></td><td align="right" width="130"><font color="Black">
                          8月05日 ~ 9月16日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          2022 Hood to Coast 越山向海人車接力臺灣賽
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/17 六
                      </font></td><td><font color="Black">南投縣魚池鄉日月潭向山遊客中心</font></td><td width="15%"><font color="Black">
                          <button title="費用：">170K</button>
                      </font></td><td width="15%"><font color="Black">YYsports (寶悍運動平台)</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.facebook.com/events/296767545714332">八百壯士超馬系列-制霸浸水營超馬</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/17 六 04:00
                      </font></td><td><font color="Black">屏東縣枋寮火車站前廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：">106K</button><button title="費用：">53K</button>
                      </font></td><td width="15%"><font color="Black">TUR/臺灣龍虎鳳越野協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lihi1.com/EQWjE/runner">2022 諸羅山關懷社區公益路跑(中埔場)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/18 日 06:00
                      </font></td><td><font color="Black">嘉義縣中埔鄉澐水順天宮</font></td><td width="15%"><font color="Black">
                          <button title="費用：950<br/>限額：共400人" class="limit">42.195K</button><button title="費用： 750<br/>限額： 共400人" class="limit">21K</button>
                      </font></td><td width="15%"><font color="Black">嘉義市諸羅山長跑協會</font></td><td align="right" width="130"><font color="Black">
                          6月15日 ~ 
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/BaoSheng2022/">2022 紅瓦厝保生盃公益馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/18 日 06:30
                      </font></td><td><font color="Black">臺南市歸仁區交通大學臺南校區</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：3000" class="limit">42.195K</button><button title="費用：<br/>限額： 500" class="limit">21K</button><button title="費用：<br/>限額： 600" class="limit">9.5K</button><button title="費用：<br/>限額： 400" class="limit">5K</button><button title="費用：<br/>限額： 200" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">臺南市紅瓦厝長跑協會</font></td><td align="right" width="130"><font color="Black">
                          8月30日 ~ 10月01日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.taipeicitymarathon.com/">2022 臺北馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          <img src="/images/aims_logo.gif" alt="AIMS Course Certificate">
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/18 日 06:30
                      </font></td><td><font color="Black">臺北市信義區市民廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：2000<br/>限額：9000" class="limit">42.195K</button><button title="費用： 1400<br/>限額： 19000" class="limit">21.0975K</button>
                      </font></td><td width="15%"><font color="Black">臺北市政府體育局</font></td><td align="right" width="130"><font color="Black">
                          8月29日 ~ 
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ctrun.com.tw/pageO.aspx?CF_ActCode=EC221218&amp;id=7069">2022 MAXWEL 馬索沃路跑趣-新北場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/18 日 06:30
                      </font></td><td><font color="Black">新北市蘆洲區微風運河成蘆大橋下</font></td><td width="15%"><font color="Black">
                          <button title="費用：">10K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣國際鐵人三項交流發展協會</font></td><td align="right" width="130"><font color="Black">
                          7月21日 ~ 9月06日<br>(最後四天)
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340" style="text-decoration:line-through;"><font color="Black">
                          <a href="https://www.ibodygo.com.tw/EventTopic.aspx?n=1339">*第十三屆合歡山越野馬拉松*</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/24 六 05:00
                      </font></td><td><font color="Black">南投縣仁愛鄉合歡山藝家原民宿</font></td><td width="15%"><font color="Black">
                          <button title="費用：1950<br/>限額：600" class="limit">43.9K</button><button title="費用： 1600<br/>限額： 600" class="limit">26K</button><button title="費用： 1200<br/>限額： 600" class="limit">7.5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣謙信越野馬拉松協會</font></td><td align="right" width="130"><font color="Black">
                          7月18日 ~ 10月10日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ibodygo.com.tw/EventTopic.aspx?n=1342">第一屆臺大校園之美土木盃路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/24 六 07:00
                      </font></td><td><font color="Black">臺北市大安區臺大土木系館前廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：900<br/>限額：200" class="limit">21K</button><button title="費用： 2800<br/>限額： 100隊" class="limit">5.3Kx4</button><button title="費用： 700<br/>限額： 400" class="limit">5.3K</button>
                      </font></td><td width="15%"><font color="Black">臺大土木校友聯誼會/臺灣環島跑者聯盟協會</font></td><td align="right" width="130"><font color="Black">
                          8月25日 ~ 10月24日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5282?utm_source=web&amp;utm_medium=post&amp;utm_campaign=tperun#25579">2022 寫信馬拉松-為人權而跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/24 六 07:00
                      </font></td><td><font color="Black">新北市三重區大臺北都會公園幸福水漾園區</font></td><td width="15%"><font color="Black">
                          <button title="費用：950<br/>限額：800" class="limit">21K</button><button title="費用： 850<br/>限額： 2200" class="limit">10K</button><button title="費用： 600<br/>限額： 2500" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">國際特赦組織台灣分會</font></td><td align="right" width="130"><font color="Black">
                          7月18日 ~ 10月21日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="http://www.ctau.org.tw/news/2022-12-24-%e5%8c%97%e5%ae%9c%e5%85%ac%e8%b7%af%e8%b6%85%e7%b4%9a%e9%a6%ac%e6%8b%89%e6%9d%be/">2022 北宜公路超級馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/24 六 07:30
                      </font></td><td><font color="Black">新北市新店區新店國小</font></td><td width="15%"><font color="Black">
                          <button title="費用：">55K</button><button title="費用：">27K</button><button title="費用：">8K</button>
                      </font></td><td width="15%"><font color="Black">社團法人中華民國超級馬拉松運動協會</font></td><td align="right" width="130"><font color="Black">
                           ~ 11月23日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bm.bais.com.tw/2201/">第五屆高雄山城100Km超級馬拉松賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/25 日 04:00
                      </font></td><td><font color="Black">高雄市美濃區美濃國中</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：600" class="limit">100K</button><button title="費用：<br/>限額： 300" class="limit">66K</button>
                      </font></td><td width="15%"><font color="Black">高雄市超級馬拉松協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lihi1.com/GYSBU/runner">2022 萬丹紅豆馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/25 日 06:00
                      </font></td><td><font color="Black">屏東縣萬丹鄉萬丹國中</font></td><td width="15%"><font color="Black">
                          <button title="費用：1100<br/>限額：1500" class="limit">42.195K</button><button title="費用： 900<br/>限額： 1500" class="limit">21K</button><button title="費用： 700<br/>限額： 1500" class="limit">11K</button><button title="費用： 300<br/>限額： 500" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">屏東縣萬丹鄉後村社區發展協會</font></td><td align="right" width="130"><font color="Black">
                          7月01日 ~ 9月30日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ctrun.com.tw/pageO.aspx?CF_ActCode=DZ221225&amp;id=7033">2022 雲豹長跑俱樂部會員大會師</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/25 日 06:30
                      </font></td><td><font color="Black">嘉義市嘉義大學蘭潭校區</font></td><td width="15%"><font color="Black">
                          <button title="費用：">42.195K</button><button title="費用：">21K</button>
                      </font></td><td width="15%"><font color="Black">臺灣運動賽事協會</font></td><td align="right" width="130"><font color="Black">
                          8月20日 ~ 9月20日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/new.gif">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/ChiayiYearNight2022/">2022 年嘉義縣跨年星光公益路跑</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/31 六 16:20
                      </font></td><td><font color="Black">嘉義縣朴子市周運祿紀念公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：600<br/>限額：300" class="limit">6K</button><button title="費用： 500<br/>限額： 200" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">中華民國青少年體育協會</font></td><td align="right" width="130"><font color="Black">
                          9月01日 ~ 10月31日
                      </font></td>
      </tr><tr class="splitline" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <span id="monthtag">1月</span><img src="/images/new.gif">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.joinnow.com.tw/about.php?cnt_id=40&amp;type=1">2023 山手線-曙光-森林-月世界馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          01/01 日 05:20
                      </font></td><td><font color="Black">臺南市龍崎區文衡殿前廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：500" class="limit">42.195K</button><button title="費用： 1000<br/>限額： 500" class="limit">21K</button><button title="費用： 800<br/>限額： 500" class="limit">8K</button>
                      </font></td><td width="15%"><font color="Black">臺南市早起鳥路跑協會</font></td><td align="right" width="130"><font color="Black">
                          9月13日 ~ 11月30日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/Yilan2023">2023 宜蘭四季絕代雙礁馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          01/01 日 06:00
                      </font></td><td><font color="Black">宜蘭縣宜蘭市窯烤山寨村</font></td><td width="15%"><font color="Black">
                          <button title="費用：1300<br/>限額：600" class="limit">42.195K</button><button title="費用： 1200<br/>限額： 600" class="limit">21K</button><button title="費用： 1100<br/>限額： 400" class="limit">10K</button><button title="費用： 650<br/>限額： 1000" class="limit">4K</button>
                      </font></td><td width="15%"><font color="Black">宜蘭縣四季健跑會</font></td><td align="right" width="130"><font color="Black">
                          8月08日 ~ 10月30日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/new.gif">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.facebook.com/events/1393900627686604">2023 八百壯士系列--制霸環中超馬</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          01/01 日 06:45
                      </font></td><td><font color="Black">臺中市大坑里福德祠社區活動中心</font></td><td width="15%"><font color="Black">
                          <button title="費用：">100K</button><button title="費用：">60.5K</button>
                      </font></td><td width="15%"><font color="Black">TUR/臺灣龍虎鳳越野協會</font></td><td align="right" width="130"><font color="Black">
                          9月01日 ~ 10月31日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5357#25826">2023 10th 長堤曙光元旦馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          01/01 日 07:00
                      </font></td><td><font color="Black">臺北市萬華區馬場町紀念公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：1350">42.195K</button><button title="費用： 1200">21K</button><button title="費用： 1000">10K</button><button title="費用： 900">5K</button>
                      </font></td><td width="15%"><font color="Black">中華民國越野運動協會</font></td><td align="right" width="130"><font color="Black">
                          8月25日 ~ 11月15日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://irunner.biji.co/whiterocklake2023">第二屆內湖鐵人白石湖公益路跑嘉年華</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          01/01 日 07:00
                      </font></td><td><font color="Black">臺北市士林區太陽廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：300">21K</button><button title="費用： 300">10K</button><button title="費用： 300">5K</button>
                      </font></td><td width="15%"><font color="Black">臺北市內湖鐵人三項運動協會</font></td><td align="right" width="130"><font color="Black">
                          8月01日 ~ 9月30日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5132#25002">2023 尖石鄉鎮西堡王者之路~撼動超級馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          <img src="/images/course_ok.png">
                      </font></td><td class="datecell" width="104"><font color="Black">
                          01/08 日 05:00
                      </font></td><td><font color="Black">新竹縣尖石鄉公所前廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：1000" class="limit">100K</button><button title="費用：<br/>限額： 400" class="limit">50 miles</button><button title="費用：<br/>限額： 1200" class="limit">50K</button>
                      </font></td><td width="15%"><font color="Black">尖石鄉公所/中華13知路跑協會</font></td><td align="right" width="130"><font color="Black">
                          7月06日 ~ 9月26日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.bao-ming.com/eb/content/5260#25446">2023 南方澳海鮮馬拉松嘉年華</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          01/08 日 06:00
                      </font></td><td><font color="Black">宜蘭縣蘇澳鎮蘇澳港旅客服務中心</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200">42.195K</button><button title="費用： 1100">21K</button><button title="費用： 1000">10K</button><button title="費用： 800">3.8K</button>
                      </font></td><td width="15%"><font color="Black">臺灣超級鐵人運動發展協會</font></td><td align="right" width="130"><font color="Black">
                           ~ 11月30日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ctrun.com.tw/pageO.aspx?CF_ActCode=EI230108&amp;id=7149">2023 MAXWEL 馬索沃路跑趣-新竹場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          01/08 日 06:30
                      </font></td><td><font color="Black">新竹縣湖口鄉湖口老街278號</font></td><td width="15%"><font color="Black">
                          <button title="費用：">13K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣運動賽事協會</font></td><td align="right" width="130"><font color="Black">
                          8月23日 ~ 10月06日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.focusline.com.tw/30115ZH/Activities/Activities.aspx">2023 第二屆卓蘭水果之鄉全國馬拉松賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          01/15 日 06:30
                      </font></td><td><font color="Black">苗栗縣卓蘭鎮卓蘭國民小學</font></td><td width="15%"><font color="Black">
                          <button title="費用：1300<br/>限額：1500" class="limit">43K</button><button title="費用： 1100<br/>限額： 1000" class="limit">22K</button><button title="費用： 900<br/>限額： 800" class="limit">12K</button><button title="費用： 700<br/>限額： 700" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">卓蘭鎮農會/臺灣野孩子野跑協會- 野玩家</font></td><td align="right" width="130"><font color="Black">
                          8月08日 ~ 10月08日
                      </font></td>
      </tr><tr class="splitline rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <span id="monthtag">2月</span><img src="/images/new.gif">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.facebook.com/events/632255858014066">2023 八百壯士系列-制霸奧萬大</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          02/05 日 05:30
                      </font></td><td><font color="Black">南投縣埔里鎮麒麟渡假山莊</font></td><td width="15%"><font color="Black">
                          <button title="費用：">100.7K</button><button title="費用：">45.1K</button>
                      </font></td><td width="15%"><font color="Black">TUR/臺灣龍虎鳳越野協會</font></td><td align="right" width="130"><font color="Black">
                          9月01日 ~ 10月31日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5157#24995">2023 臺北超級馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          <img src="/images/course_ok.png">
                      </font></td><td class="datecell" width="104"><font color="Black">
                          02/10 五 15:00
                      </font></td><td><font color="Black">臺北市中山區花博公園新生園區</font></td><td width="15%"><font color="Black">
                          <button title="費用：">48H</button><button title="費用：">24H</button><button title="費用：">12H</button><button title="費用：">100K</button>
                      </font></td><td width="15%"><font color="Black">中華民國超級馬拉松運動協會</font></td><td align="right" width="130"><font color="Black">
                          3月23日 ~ 1月09日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.focusline.com.tw/20219WS/Activities/Activities.aspx?Page=Txt201706221532139638_ran">經典重現~2023久美超級馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          02/11 六 06:00
                      </font></td><td><font color="Black">南投縣信義鄉久美社區活動中心</font></td><td width="15%"><font color="Black">
                          <button title="費用：2500<br/>限額：300" class="limit">72K</button><button title="費用： 1700<br/>限額： 300" class="limit">43K</button><button title="費用： 1100<br/>限額： 200" class="limit">22K</button><button title="費用： 800<br/>限額： 200" class="limit">10K</button>
                      </font></td><td width="15%"><font color="Black">久美社區發展協會</font></td><td align="right" width="130"><font color="Black">
                          7月11日 ~ 11月30日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ctrun.com.tw/pageO.aspx?CF_ActCode=EH230212&amp;id=7117">2023 MAXWEL 馬索沃路跑趣-臺南場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          02/12 日 06:30
                      </font></td><td><font color="Black">臺南市鹽水區老人文康中心</font></td><td width="15%"><font color="Black">
                          <button title="費用：">10.5K</button><button title="費用：">4K</button>
                      </font></td><td width="15%"><font color="Black">臺灣運動賽事協會</font></td><td align="right" width="130"><font color="Black">
                          8月11日 ~ 9月22日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/new.gif">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ctrun.com.tw/pageO.aspx?CF_ActCode=EJ230219&amp;id=7180">2023 MAXWEL 馬索沃生態路跑-屏東場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          02/19 日 06:30
                      </font></td><td><font color="Black">屏東縣潮州鎮林後四林平地森林園區</font></td><td width="15%"><font color="Black">
                          <button title="費用：">10K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣運動賽事協會</font></td><td align="right" width="130"><font color="Black">
                          9月06日 ~ 10月20日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.focusline.com.tw/30226YZ/Activities/Activities.aspx?Page=Txt202207271425333742_ran">2023 第六屆奮起雲擁~經典百K馬拉松挑戰賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          02/26 日 04:00
                      </font></td><td><font color="Black">嘉義市立體育場</font></td><td width="15%"><font color="Black">
                          <button title="費用：3100<br/>限額：250" class="limit">100K</button><button title="費用： 2800<br/>限額： 100" class="limit">76K</button><button title="費用： 2100<br/>限額： 150" class="limit">50K</button><button title="費用： 1100<br/>限額： 200" class="limit">33K</button><button title="費用： 800<br/>限額： 200" class="limit">12K</button>
                      </font></td><td width="15%"><font color="Black">嘉義市諸羅山長跑協會</font></td><td align="right" width="130"><font color="Black">
                          8月01日 ~ 9月30日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5193#25128">2023 SUPERACE 超級馬拉松多日賽 阿里山站</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          02/26 日 06:00
                      </font></td><td><font color="Black">嘉義縣阿里山鄉樂野服務區</font></td><td width="15%"><font color="Black">
                          <button title="費用：15000">35K+50K+21K</button>
                      </font></td><td width="15%"><font color="Black">社團法人臺灣體育運動競技協會</font></td><td align="right" width="130"><font color="Black">
                          4月25日 ~ 1月05日
                      </font></td>
      </tr><tr class="splitline rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <span id="monthtag">3月</span>
                      </font></td><td width="340"><font color="Black">
                          <a href="http://www.ctau.org.tw/news/2023-01-07-%e9%96%8b%e5%bb%a3%e9%a3%9b%e8%b7%91%e7%9b%83%e9%99%bd%e6%98%8e%e5%b1%b1%e8%b6%85%e7%b4%9a%e9%a6%ac%e6%8b%89%e6%9d%be/">2023 開廣飛跑盃陽明山超級馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          03/04 六 06:00
                      </font></td><td><font color="Black">臺北市士林區至善國中</font></td><td width="15%"><font color="Black">
                          <button title="費用：">63K</button><button title="費用：">50K</button><button title="費用：">42.195K</button><button title="費用：">20K</button><button title="費用：">10K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">社團法人中華民國超級馬拉松運動協會</font></td><td align="right" width="130"><font color="Black">
                           ~ 1月31日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5224#25352">2023 LAVA TRI 玩賽樂園</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          03/04 六 06:00
                      </font></td><td><font color="Black">臺東縣臺東市森林公園活水湖</font></td><td width="15%"><font color="Black">
                          <button title="費用：12999<br/>限額：共2200組" class="limit">3.8K+180K+42.2K</button><button title="費用： 6799<br/>限額： 共2200組" class="limit">1.9K+90K+21.1K</button><button title="費用： 3499<br/>限額： 共2200組" class="limit">1.5K+40K+10K</button>
                      </font></td><td width="15%"><font color="Black">臺灣耐力運動協會/LAVA Sports臺灣鐵人三項公司</font></td><td align="right" width="130"><font color="Black">
                          6月01日 ~ 1月15日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          2023 高美濕地馬拉松
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          03/05 日
                      </font></td><td><font color="Black">臺中市</font></td><td width="15%"><font color="Black">
                          <button title="費用：">42.195K</button><button title="費用：">21K</button><button title="費用：">10K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">&nbsp;</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5233#25368">2023 第12屆南橫(霧鹿峽谷)超級馬拉松</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          03/11 六 05:00
                      </font></td><td><font color="Black">臺東縣關山鎮天后宮</font></td><td width="15%"><font color="Black">
                          <button title="費用：<br/>限額：共1500人" class="limit">100K</button><button title="費用：<br/>限額： 共1500人" class="limit">60K</button><button title="費用：<br/>限額： 共1500人" class="limit">45K</button><button title="費用：<br/>限額： 共1500人" class="limit">22K</button>
                      </font></td><td width="15%"><font color="Black">南橫超級馬拉松俱樂部</font></td><td align="right" width="130"><font color="Black">
                          6月01日 ~ 12月15日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.bao-ming.com/eb/content/5321#25741">2023 關山慈濟醫院23週年路跑賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          03/12 日 07:00
                      </font></td><td><font color="Black">臺東縣關山鎮</font></td><td width="15%"><font color="Black">
                          <button title="費用：600">14K</button><button title="費用： 0">5K</button>
                      </font></td><td width="15%"><font color="Black">佛教慈濟醫療財團法人關山慈濟醫院</font></td><td align="right" width="130"><font color="Black">
                           ~ 11月30日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5213#25283">2023 普悠瑪鐵人三項賽226 KM／113 KM</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          03/18 六 06:00
                      </font></td><td><font color="Black">臺東縣臺東市活水湖</font></td><td width="15%"><font color="Black">
                          <button title="費用：">3.8K+180K+42.2K</button><button title="費用：">1.9K+90K+21.1K</button>
                      </font></td><td width="15%"><font color="Black">臺東縣城鄉生活運動協會</font></td><td align="right" width="130"><font color="Black">
                           ~ 11月30日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/new.gif">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.facebook.com/events/835341187461122">2023 八百壯士系列-制霸貓貍超馬</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          03/19 日 05:00
                      </font></td><td><font color="Black">苗栗縣頭屋鄉雲洞宮</font></td><td width="15%"><font color="Black">
                          <button title="費用：">100.4K</button><button title="費用：">51.3K</button>
                      </font></td><td width="15%"><font color="Black">TUR/臺灣龍虎鳳越野協會</font></td><td align="right" width="130"><font color="Black">
                          10月01日 ~ 11月30日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5213#25283">2023 普悠瑪鐵人三項51.5 KM / 47.5KM / 小鐵人</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          03/19 日 06:30
                      </font></td><td><font color="Black">臺東縣臺東市活水湖</font></td><td width="15%"><font color="Black">
                          <button title="費用：">1.5K+40K+10K</button><button title="費用：">2.5K+40K+5K</button>
                      </font></td><td width="15%"><font color="Black">臺東縣城鄉生活運動協會</font></td><td align="right" width="130"><font color="Black">
                           ~ 11月30日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.womenruntpe.com/">2023 TAISHIN WOMEN RUN (由2022/3/27延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          <img src="/images/aims_logo.gif" alt="AIMS Course Certificate">
                      </font></td><td class="datecell" width="104"><font color="Black">
                          03/26 日 06:00
                      </font></td><td><font color="Black">高雄市前鎮區夢時代廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：800<br/>限額：2900" class="limit">10K</button><button title="費用： 500<br/>限額： 1500" class="limit">3.5K</button>
                      </font></td><td width="15%"><font color="Black">中華民國路跑協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          2023 神岡馬-神豐國際同濟會全國馬拉松
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          03/26 日 06:00
                      </font></td><td><font color="Black">臺中市神岡區神岡國小</font></td><td width="15%"><font color="Black">
                          <button title="費用：">42.195K</button><button title="費用：">21K</button><button title="費用：">10.5K</button><button title="費用：">4.5K</button>
                      </font></td><td width="15%"><font color="Black">神豐國際同濟會</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/new.gif">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.ctrun.com.tw/pageO.aspx?CF_ActCode=EK230326&amp;id=7195">2023 MAXWEL 馬索沃路跑趣-宜蘭場</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          03/26 日 06:30
                      </font></td><td><font color="Black">宜蘭縣宜蘭市宜蘭運動公園</font></td><td width="15%"><font color="Black">
                          <button title="費用：">10K</button><button title="費用：">6K</button>
                      </font></td><td width="15%"><font color="Black">臺灣運動賽事協會</font></td><td align="right" width="130"><font color="Black">
                          9月14日 ~ 10月27日
                      </font></td>
      </tr><tr class="splitline rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <span id="monthtag">4月</span>
                      </font></td><td width="340" style="text-decoration:line-through;"><font color="Black">
                          *2023 橫越臺灣超級馬拉松*
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          04/01 六 19:00
                      </font></td><td><font color="Black">臺中市梧棲區臺中港酒店</font></td><td width="15%"><font color="Black">
                          <button title="費用：">246K</button><button title="費用：">165K</button><button title="費用：">110K</button><button title="費用：">50K</button>
                      </font></td><td width="15%"><font color="Black">社團法人中華民國超級馬拉松運動協會</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.facebook.com/CrufuRun/">5th CRUFU RUN 夸父追日跨夜接力賽-東臺灣站</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          04/08 六
                      </font></td><td><font color="Black">臺東縣臺東市臺東糖廠文創園區 </font></td><td width="15%"><font color="Black">
                          <button title="費用：">210K</button>
                      </font></td><td width="15%"><font color="Black">中華健康生活運動保健協會/司格特國際運動行銷有限公司</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/new.gif">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.facebook.com/events/661831528636379">2023 八百壯士系列-制霸洄瀾超馬</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          04/09 日 05:00
                      </font></td><td><font color="Black">花蓮縣花蓮市國福棒壘球場</font></td><td width="15%"><font color="Black">
                          <button title="費用：">104.5K</button><button title="費用：">49K</button>
                      </font></td><td width="15%"><font color="Black">TUR/臺灣龍虎鳳越野協會</font></td><td align="right" width="130"><font color="Black">
                          10月01日 ~ 11月30日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.womenruntpe.com/">2023 TAISHIN WOMEN RUN (由2022/4/10延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          <img src="/images/aims_logo.gif" alt="AIMS Course Certificate">
                      </font></td><td class="datecell" width="104"><font color="Black">
                          04/09 日 05:30
                      </font></td><td><font color="Black">臺北市信義區市民廣場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：6000" class="limit">21K</button><button title="費用： 800<br/>限額： 3200" class="limit">10K</button><button title="費用： 500<br/>限額： 1000" class="limit">3K</button>
                      </font></td><td width="15%"><font color="Black">中華民國路跑協會</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          2023 第24屆臺灣戶外風櫃嘴全國馬拉松賽
                      </font></td><td align="right" width="5"><font color="Black">
                          <img src="/images/course_ok.png">
                      </font></td><td class="datecell" width="104"><font color="Black">
                          04/09 日 06:00
                      </font></td><td><font color="Black">臺北市士林區至善國中</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：1300" class="limit">42.195K</button><button title="費用： 1000<br/>限額： 1200" class="limit">21K</button><button title="費用： 800<br/>限額： 800" class="limit">10K</button>
                      </font></td><td width="15%"><font color="Black">社團法人臺灣戶外路跑協會</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          XTERRA 全球越野三項巡迴賽－臺灣站
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          04/15 六
                      </font></td><td><font color="Black">屏東縣恆春鎮墾丁石牛溪農場</font></td><td width="15%"><font color="Black">
                          
                      </font></td><td width="15%"><font color="Black">LAVA 臺灣鐵人三項公司</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5267#25638">2023 dodo桃園國際馬拉松(由2022/10/15延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          04/15 六 05:00
                      </font></td><td><font color="Black">桃園市新屋區永安海螺文化體驗園區</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：1000" class="limit">42.195K</button><button title="費用： 1000<br/>限額： 2000" class="limit">21K</button><button title="費用： 800<br/>限額： 2000" class="limit">10K</button><button title="費用： 600<br/>限額： 2000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">渡簬企業股份有限公司/名衍行銷股份有限公司</font></td><td align="right" width="130"><font color="Black">
                           ~ 1月31日
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          XTERRA 全球越野跑巡迴賽－臺灣站
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          04/16 日
                      </font></td><td><font color="Black">屏東縣恆春鎮墾丁石牛溪農場</font></td><td width="15%"><font color="Black">
                          
                      </font></td><td width="15%"><font color="Black">LAVA臺灣鐵人三項公司</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr class=" rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          
                      </font></td><td width="340"><font color="Black">
                          2023 葫蘆墩馬拉松
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          04/16 日
                      </font></td><td><font color="Black">臺中市豐原區豐原體育場</font></td><td width="15%"><font color="Black">
                          <button title="費用：">42.195K</button><button title="費用：">21K</button><button title="費用：">11K</button><button title="費用：">5K</button>
                      </font></td><td width="15%"><font color="Black">臺中市豐原慢跑協會</font></td><td align="right" width="130"><font color="Black">
                          
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/update.png">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://reurl.cc/9OQ7ma">2022 鄉鎮之美馬拉松-大安場(由2022/9/4延期)</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          04/22 六 06:00
                      </font></td><td><font color="Black">大安海水浴場濱海樂園停車場(於大安濱海旅客服務中心旁)</font></td><td width="15%"><font color="Black">
                          <button title="費用：">42.6K</button><button title="費用：">24K</button><button title="費用：">12K</button>
                      </font></td><td width="15%"><font color="Black">欣恩創意國際有限公司</font></td><td align="right" width="130"><font color="Black">
                          已截止
                      </font></td>
      </tr><tr class="splitline rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <span id="monthtag">5月</span>
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.bao-ming.com/eb/content/5226#25319">2023 tSt 新北微風鐵人賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          05/14 日 06:00
                      </font></td><td><font color="Black">新北市蘆洲區微風運河周邊</font></td><td width="15%"><font color="Black">
                          <button title="費用：">1.9K+90K+21K</button><button title="費用：">1.5K+40K+10K</button><button title="費用：">0.75K+20K+5K</button><button title="費用：">5K+40K+5K</button>
                      </font></td><td width="15%"><font color="Black">新北市超級鐵人運動發展協會</font></td><td align="right" width="130"><font color="Black">
                           ~ 3月03日
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/new.gif">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.facebook.com/events/1133621420843067">2023 八百壯士系列-制霸石門超馬</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          05/21 日 05:00
                      </font></td><td><font color="Black">桃園市龍潭區南天宮</font></td><td width="15%"><font color="Black">
                          <button title="費用：">101.3K</button><button title="費用：">51.8K</button>
                      </font></td><td width="15%"><font color="Black">TUR/臺灣龍虎鳳越野協會</font></td><td align="right" width="130"><font color="Black">
                          10月01日 ~ 11月30日
                      </font></td>
      </tr><tr class="splitline rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <span id="monthtag">7月</span>
                      </font></td><td width="340"><font color="Black">
                          <a href="https://bao-ming.com/eb/content/5341#25760">2023 tSt 嘉義布袋鐵人賽</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          07/23 日 06:00
                      </font></td><td><font color="Black">嘉義縣布袋鎮海風長堤周邊</font></td><td width="15%"><font color="Black">
                          <button title="費用：">1.5K+45K+10K</button><button title="費用：">0.75K+30K+5K</button><button title="費用：">5K+45K+5K</button>
                      </font></td><td width="15%"><font color="Black">臺灣超級鐵人運動發展協會</font></td><td align="right" width="130"><font color="Black">
                           ~ 5月31日
                      </font></td>
      </tr><tr class="splitline" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <span id="monthtag">10月</span><img src="/images/new.gif">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.facebook.com/events/1475905222857496">2023 八百壯士系列-制霸水沙漣超馬</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          10/15 日 05:00
                      </font></td><td><font color="Black">南投縣埔里鎮麒麟渡假山莊</font></td><td width="15%"><font color="Black">
                          <button title="費用：">101.7K</button><button title="費用：">49K</button>
                      </font></td><td width="15%"><font color="Black">TUR/臺灣龍虎鳳越野協會</font></td><td align="right" width="130"><font color="Black">
                          5月01日 ~ 6月30日
                      </font></td>
      </tr><tr class="splitline rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <span id="monthtag">11月</span>
                      </font></td><td width="340"><font color="Black">
                          <a href="https://lohasnet.tw/Taichung-marathon2021/">2023 臺中國際馬拉松-水岸花都‧幸福の台中3</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/05 日 06:15
                      </font></td><td><font color="Black">臺中市后里區后里馬場</font></td><td width="15%"><font color="Black">
                          <button title="費用：1200<br/>限額：4000" class="limit">42.195K</button><button title="費用： 1050<br/>限額： 5000" class="limit">21K</button><button title="費用： 950<br/>限額： 5000" class="limit">13K</button><button title="費用： 750<br/>限額： 4000" class="limit">5K</button>
                      </font></td><td width="15%"><font color="Black">臺中市政府運動局/社團法人臺中市繁榮葫蘆墩促進會</font></td><td align="right" width="130"><font color="Black">
                          7月11日 ~ 
                      </font></td>
      </tr><tr align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <img src="/images/new.gif">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.facebook.com/events/833441090960919">2023 八百壯士系列-制霸風城超馬</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          11/12 日 05:30
                      </font></td><td><font color="Black">苗栗縣南庄鄉獅頭山勸化堂</font></td><td width="15%"><font color="Black">
                          <button title="費用：">101.1K</button><button title="費用：">52.3K</button>
                      </font></td><td width="15%"><font color="Black">TUR/臺灣龍虎鳳越野協會</font></td><td align="right" width="130"><font color="Black">
                          5月01日 ~ 6月30日
                      </font></td>
      </tr><tr class="splitline rowbackgroundcolor" align="left" onclick="select(this);">
        <td class="newcell" align="right"><font color="Black">
                          <span id="monthtag">12月</span><img src="/images/new.gif">
                      </font></td><td width="340"><font color="Black">
                          <a href="https://www.facebook.com/events/666658568497664">2023 八百壯士系列-制霸浸水營超馬</a>
                      </font></td><td align="right" width="5"><font color="Black">
                          
                      </font></td><td class="datecell" width="104"><font color="Black">
                          12/09 六 04:00
                      </font></td><td><font color="Black">屏東縣枋寮鄉枋寮車站</font></td><td width="15%"><font color="Black">
                          <button title="費用：">106K</button><button title="費用：">53K</button>
                      </font></td><td width="15%"><font color="Black">TUR/臺灣龍虎鳳越野協會</font></td><td align="right" width="130"><font color="Black">
                          7月01日 ~ 8月31日
                      </font></td>
      </tr>
    </tbody></table>
  </div>
          
      
      </form>
  
  
  </body>`;

  const expectResponse = fs
    .readFileSync(
      join(process.cwd(), './test/mock-files/expect-events-result.json'),
    )
    .toString();
  const mockJsonResponse: EventResponseDto = JSON.parse(expectResponse);

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
            sort: jest.fn().mockImplementation(() => {
              return {
                exec: jest.fn().mockResolvedValue([mockData]),
              };
            }),
          };
        }),
      };
    });
    static findOne = jest.fn().mockImplementation(() => {
      return {
        select: jest.fn().mockImplementation(() => {
          return {
            exec: jest.fn().mockResolvedValue(mockData),
          };
        }),
        updateOne: jest.fn().mockResolvedValue(true),
      };
    });
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
          provide: SlackService,
          useValue: {
            sendText: jest.fn(),
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
    const expectResult: EventOutputDto[] = mockJsonResponse.data.events;
    expect(result).toEqual(expectResult);
  });

  it('testGetEvents', async () => {
    const eventInputDto: EventInputDto = {
      sortBy: 'eventDate',
      orderBy: 'asc',
    };
    expect(await service.getEvents(eventInputDto)).toEqual([mockData]);
  });

  it('testGetEvent', async () => {
    expect(
      await service.getEvent('2022 臺灣米倉田中馬拉松', '2022-11-13'),
    ).toEqual(mockData);
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
