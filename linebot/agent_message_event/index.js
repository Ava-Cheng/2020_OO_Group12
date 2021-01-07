let fetch = require('node-fetch');
let fs = require('fs');
let ini = require('ini');
let config = ini.parse(fs.readFileSync('./config/config.ini', 'utf8'));
let moment = require('moment');
const { stringify } = require('querystring');

// 主程式
function main(req) {
  let type = req.body.message.type;// 使用者傳送過來的訊息類別
  let replyToken = req.body.replyToken;// 立即回覆Token(時效30s)
  let user_id = req.body.source.userId;// LINEID

  // 訊息事件處理
  message_event(req,type,replyToken,user_id);
}

// 訊息事件處理
function message_event(req,type,replyToken,user_id) {
  if (type == 'text') {
    text = req.body.message.text;
  } else if (type == 'image') {
    text = "圖片";
  } else if (type == 'video') {
    text = "影片";
  } else if (type == 'audio') {
    text = "音訊";
  } else if (type == 'location') {
    text = "地址位置";
  } else if (type == 'imagemap') {
    text = "圖片地圖";
  } else if (type == 'Template') {
    text = "模板訊息";
  } else if (type == 'Flex') {
    text = "彈性訊息";
  } else if (type == 'sticker') {
    text = "貼圖";
  }

  send_message(user_id, text, replyToken);
}

// 訊息處理
function send_message(user_id, text, replyToken) {
  //回覆採用reply無上限(但需在一分鐘內回覆)
  if (text.indexOf("最新") != -1 || text.indexOf("消息") != -1 || text.indexOf("最新消息") != -1) {
    news(replyToken, user_id);
  } else if (text.indexOf("訊息") != -1 || text.indexOf("公告") != -1 || text.indexOf("註冊") != -1 || text.indexOf("登入") != -1 || text.indexOf("信徒") != -1 || text.indexOf("個人") != -1 || text.indexOf("資料") != -1 ||  text.indexOf("會員") != -1 || text.indexOf("光明") != -1 || text.indexOf("燈") != -1 || text.indexOf("農民曆") != -1 || text.indexOf("日曆") != -1) {
    liff_handle(replyToken, text, user_id);
  }  else {
    // 訊息reply
    let request = {
      'replyToken': replyToken,
      'messages': [{ "type": "text", "text": "感謝您的提問，我們已收到您的訊息。" }]
    };
    line_message_reply(request, user_id);
  }
}

// 最新消息訊息
function news(replyToken, user_id) {
  let data = {
    api_name: 'news',
    user_id: user_id
  }
  fetch(config.api_url.DB_proxy, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((responseData) => {
      let request = {
        'replyToken': replyToken,
        'messages': [{ "type": "text", "text": responseData['news'] }]
      };

      // 訊息reply
      line_message_reply(request, user_id);
    })
    .catch((error) => {
      console.log(error);
      push_splunk('news', 'FATAL', user_id, 'Error');
    })
}

// liff 判斷
function liff_handle(replyToken, text, user_id) {
  if (text.indexOf("訊息") != -1 || text.indexOf("公告") != -1 ) {
    liff_news(replyToken, user_id);
  }else if(text.indexOf("註冊") != -1 || text.indexOf("登入") != -1){
    user_check(replyToken, user_id);
  }else if(text.indexOf("信徒") != -1 || text.indexOf("個人") != -1 || text.indexOf("資料") != -1 ||  text.indexOf("會員") != -1){
    user_data(user_id,replyToken);
  }else if(text.indexOf("光明") != -1 || text.indexOf("燈") != -1){
    bright_lights(user_id,replyToken);
  }else if(text.indexOf("農民曆") != -1 || text.indexOf("日曆") != -1){
    calendar(user_id,replyToken);
  }
}

// Liff最新消息
function liff_news(replyToken, user_id) {
  let liff_text = '訊息公告';
  let button_message = {
    "type": "template",
    "altText": liff_text,
    "template": {
      "type": "buttons",
      "thumbnailImageUrl": config.liff.img_url + 'news.jpg',
      "imageAspectRatio": "rectangle",
      "imageSize": "cover",
      "imageBackgroundColor": "#FFFFFF",
      "title": liff_text,
      "text": "第一手消息 看過來",
      "defaultAction": {
        "type": "uri",
        "label": "訊息公告",
        "uri": config.liff.liff_url+"?pageid=news",
      },
      "actions": [
        {
          "type": "uri",
          "label": liff_text,
          "uri": config.liff.liff_url+"?pageid=news",
        }
      ]
    }
  }
  let request = { 'replyToken': replyToken, 'messages': [button_message] };
  line_message_reply(request, user_id);
}

// 是否有登入確認
function user_check(replyToken, user_id) {
  let data = {
    api_name: 'user_check',
    user_id: user_id
  }
  fetch(config.api_url.DB_proxy, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData['status']=='Exist') {
        // 訊息reply
        let request = {
          'replyToken': replyToken,
          'messages': [{ "type": "text", "text": "登入成功。" }]
        };
        line_message_reply(request, user_id);
        change_richmenu(user_id,config.line.richmenu_3);
      } else if(responseData['status']=='Does Not Exist'){
        registered(replyToken, user_id);
      }
    })
    .catch((error) => {
      console.log(error);
      push_splunk('user_check', 'FATAL', user_id, 'Errror');
    })
}

// Liff未註冊處理
function registered(replyToken, user_id) {
  let liff_text = '您尚未註冊';
  let button_message = {
    "type": "template",
    "altText": liff_text,
    "template": {
      "type": "buttons",
      "thumbnailImageUrl": config.liff.img_url + "registered.jpeg",
      "imageAspectRatio": "rectangle",
      "imageSize": "cover",
      "imageBackgroundColor": "#FFFFFF",
      "title": liff_text,
      "text": "歡迎註冊，資料用途為依據農民曆推播個人化訊息",
      "defaultAction": {
        "type": "uri",
        "label": "立即註冊",
        "uri": config.liff.liff_url + "?pageid=registered&user_id="+user_id,
      },
      "actions": [
        {
          "type": "uri",
          "label": "立即註冊",
          "uri": config.liff.liff_url + "?pageid=registered&user_id="+user_id,
        }
      ]
    }
  }
  let request = { 'replyToken': replyToken, 'messages': [button_message] };
  line_message_reply(request, user_id);
}

// 信徒資料查詢
function user_data(user_id,replyToken) {
  let data = {
    api_name: 'user_data',
    user_id: user_id
  }
  fetch(config.api_url.DB_proxy, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then((response) => response.json())
    .then((responseData) => {
      liff_user_data(replyToken, user_id,responseData['name'],responseData['birthday'],responseData['sex']);
    })
    .catch((error) => {
      console.log(error);
      push_splunk('user_data', 'FATAL', user_id, 'Errror');
    })
}

// Liff信徒資料
function liff_user_data(replyToken, user_id,name,birthday,sex){
  let liff_text = '信徒資料';
  if(sex=="Man"){
    sex="0";
  }else if(sex=="Ms"){
    sex="1";
  }
  let button_message = {
    "type": "template",
    "altText": liff_text,
    "template": {
      "type": "buttons",
      "thumbnailImageUrl": config.liff.img_url + "user_data.jpg",
      "imageAspectRatio": "rectangle",
      "imageSize": "cover",
      "imageBackgroundColor": "#FFFFFF",
      "title": liff_text,
      "text": "查看您的個人資料",
      "defaultAction": {
        "type": "uri",
        "label": "信徒資料",
        "uri": config.liff.liff_url + "?pageid=user_data&birthday="+birthday+"&sex="+sex+"&name="+name,
      },
      "actions": [
        {
          "type": "uri",
          "label": "信徒資料",
          "uri": config.liff.liff_url + "?pageid=user_data&birthday="+birthday+"&sex="+sex+"&name="+name,
        }
      ]
    }
  }
  let request = { 'replyToken': replyToken, 'messages': [button_message] };
  line_message_reply(request, user_id);
}

// Liff光明燈
function bright_lights(user_id,replyToken){
  let liff_text = '數位光明燈';
  let button_message = {
    "type": "template",
    "altText": liff_text,
    "template": {
      "type": "buttons",
      "thumbnailImageUrl": config.liff.img_url + "bright_lights.jpg",
      "imageAspectRatio": "rectangle",
      "imageSize": "cover",
      "imageBackgroundColor": "#FFFFFF",
      "title": liff_text,
      "text": "歡迎點燈，我們有安太歲、光明燈、文昌燈、拜斗燈，以上這些光明燈類型",
      "defaultAction": {
        "type": "uri",
        "label": "數位光明燈",
        "uri": config.liff.liff_url + "?pageid=bright_lights&user_id="+user_id,
      },
      "actions": [
        {
          "type": "uri",
          "label": "數位光明燈",
          "uri": config.liff.liff_url + "?pageid=bright_lights&user_id="+user_id,
        }
      ]
    }
  }
  let request = { 'replyToken': replyToken, 'messages': [button_message] };
  line_message_reply(request, user_id);
}

// Liff數位農民曆
function calendar(user_id,replyToken){
  let liff_text = '數位農民曆';
  let button_message = {
    "type": "template",
    "altText": liff_text,
    "template": {
      "type": "buttons",
      "thumbnailImageUrl": config.liff.img_url + "calendar.jpg",
      "imageAspectRatio": "rectangle",
      "imageSize": "cover",
      "imageBackgroundColor": "#FFFFFF",
      "title": liff_text,
      "text": "歡迎查看數位農民曆",
      "defaultAction": {
        "type": "uri",
        "label": "數位農民曆",
        "uri": config.liff.liff_url + "?pageid=calendar",
      },
      "actions": [
        {
          "type": "uri",
          "label": "數位農民曆",
          "uri": config.liff.liff_url + "?pageid=calendar",
        }
      ]
    }
  }
  let request = { 'replyToken': replyToken, 'messages': [button_message] };
  line_message_reply(request, user_id);
}

// 改變richmenu
function change_richmenu(user_id,richmenu_id) {
  let richmenu_api = config.api_url.line_user + user_id + '/richmenu/' + richmenu_id;
  return fetch(richmenu_api, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + config.line.token
    },
  })
    .then((response) => response.json())
    .then((responseData) => {
    })
    .catch((error) => {
      console.log(error);
      push_splunk('change_richmenu', 'FATAL', user_id, 'Error');
    })
}

// 訊息reply
function line_message_reply(request, user_id) {
  fetch(config.api_url.line_message_reply, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + config.line.token
    },
    body: JSON.stringify(request)
  })
    .then((response) => response.json())
    .then((responseData) => { })
    .catch((error) => {
      console.log(error);
      push_splunk('line_message_reply', 'FATAL', user_id, 'Error');
    })
}

// 傳送到splunk
function push_splunk(api_name, level, user_id, msg) {
  let splunk_data = {
    API_Name: api_name,
    Level: level,
    UserID: user_id,
    Msg: msg,
    Timestamp: now_time()
  }
  fetch(config.api_url.splunk, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 'msg': JSON.parse(JSON.stringify(splunk_data)), 'port': config.splunk.port }),
  })
    .then(
      (response) => response.json()
    )
    .then((responseData) => {
    })
    .catch(
      (error) => {
        console.log('Error:', error);
      }
    )
}

// 取得現在時間UTC+8
function now_time() {
  let time = (moment().add(8, 'hours')).format('YYYY-MM-DD HH:mm:ss');
  return time;
}

exports.handler = (req, res) => {
  // 跨域的header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // 主程式
  main(req);

  res.status(200).send({ status: 'OK' });
};
