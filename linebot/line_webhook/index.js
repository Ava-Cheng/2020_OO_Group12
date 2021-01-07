let fetch = require('node-fetch');
let moment = require('moment');
let fs = require('fs');
let ini = require('ini');
let config = ini.parse(fs.readFileSync('./config/config.ini', 'utf8'));

// event handler
function handleEvent(event) {
  let event_type = event.type;
  let user_id = event.source.userId;

  const dir = async function () {
    await  user_check(user_id);
    // 判斷事件類型，去做相對應的事情
    await event_if(event, user_id);
    // 將event寫入DB
    await event_write(event, event_type, user_id);
  }

  dir();
}

// 判斷事件類型，去做相對應的事情
function event_if(event, user_id) {
  if (event.type === 'message') {// 接收到LINE BOT訊息事件
    let api_url = config.api_url.get_messageevent;
    action(event, api_url, user_id);
  } else {// 其他事件
    console.log("other");
  }
}

// 依據事件去做post
function action(event, api_url, user_id) {
  fetch(api_url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event),
  })
    .then(
      (response) => response.json()
    )
    .catch(
      (error) => { 
        console.log(error);
        push_splunk("webhook", "FATAL", user_id, "Error");
      }
    )
}

// 將event寫入DB
function event_write(event, event_type, user_id) {
  // 如果是訊息事件，紀錄訊息內容
  if (event_type == 'message') {
    message = JSON.stringify(event.message);
  }
  let data = {
    api_name: 'event_write',
    event_type: event_type,
    source: JSON.stringify(event.source),
    timestamp: event.timestamp,
    mode: event.mode,
    message: message,
    user_id: user_id
  }
  fetch(config.api_url.DB_proxy, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
    .then(
      (response) => response.json()
    )
    .catch(
      (error) => {
        console.log(error);
        push_splunk('event_write', 'FATAL', user_id, 'Error');
      }
    )
}

// 是否有登入確認
function user_check(user_id) {
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
        change_richmenu(user_id,config.line.richmenu_3);
      } else if(responseData['status']=='Does Not Exist'){
        change_richmenu(user_id,config.line.richmenu_1);
      }
    })
    .catch((error) => {
      console.log(error);
      push_splunk('user_check', 'FATAL', user_id, 'Errror');
    })
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
  Promise
    .all(req.body.events.map(handleEvent))
    .then(result => res.status(200).send(`Success: ${result}`))
    .catch(err => res.status(400).send(err.toString()));
};