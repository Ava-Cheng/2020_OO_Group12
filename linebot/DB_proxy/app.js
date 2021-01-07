let fetch = require('node-fetch');
let fs = require('fs');
let ini = require('ini');
let config = ini.parse(fs.readFileSync('./config/config.ini', 'utf8'));
let mysql = require('mysql');
let moment = require('moment');
const { kMaxLength } = require('buffer');

// DB連線
let connection = mysql.createConnection({
  host: config.mySQL.host,
  user: config.mySQL.user,
  password: config.mySQL.password,
  port: config.mySQL.port,
  database: config.mySQL.database,
  charset: config.mySQL.charset
});
connection.connect();

function main(res, req) {
  let api_name = req.body.api_name;

  // 光明燈
  if (api_name == 'bright_lights') {
    let user_id = req.body.user_id;
    let name = req.body.name;
    let birthday = req.body.birthday;
    let sex = req.body.sex;
    let light_type = req.body.light_type;
    // 基本資料格式檢查
    let check = check_information(res, user_id, name, birthday, sex, light_type);
    // 是否有重複點燈檢查，沒有才能點燈
    if (check) {
      check_exist(res, api_name, user_id, name, birthday, sex, light_type);
    }
  } else if (api_name == 'event_write') {
    // webhook event 資料寫入
    let user_id = req.body.user_id;
    let event_type = req.body.event_type;
    let source = req.body.source;
    let timestamp = req.body.timestamp;
    let mode = req.body.mode;
    let message = req.body.message;
    event_write(res, api_name, event_type, source, timestamp, mode, message, user_id);
  }else if(api_name == 'news'){
    // 搜尋最新消息
    let user_id = req.body.user_id;
    news(res, api_name,user_id);
  }else if(api_name == 'user_check'){
    // 使用者是否有註冊過確認
    let user_id = req.body.user_id;
    user_check(res, api_name,user_id);
  }else if(api_name == 'user_add'){
    // 新增使用者資料-註冊
    let user_id = req.body.user_id;
    let name = req.body.name;
    let birthday = req.body.birthday;
    let sex = req.body.sex;
    user_add(res, api_name,user_id,name,birthday,sex);
  }else if(api_name == 'query_light'){
    // 尚未合成圖片搜尋
    query_light(res, api_name);
  }else if(api_name == 'light_up'){
    // 點燈圖片合成完成
    let user_id = req.body.user_id;
    let id = req.body.id;
    light_up(res, api_name,user_id,id);
  }else if(api_name == 'user_data'){
    // 信徒資料查詢
    let user_id = req.body.user_id;
    user_data(res, api_name,user_id);
  }
}

// 基本資料格式檢查
function check_information(res, user_id, name, birthday, sex, light_type) {
  let check = true;

  // 姓名格式檢查
  // TODO: 是否含有特殊符號等檢查
  if (name.length > 5) {
    check = false;
    res.status(200).send({ status: 'Name wrong format' });
  }

  // user_id檢查
  // TODO: 是否含有特殊符號等檢查
  if (user_id.length != 33) {
    check = false;
    res.status(200).send({ status: 'User_id wrong format' });
  }

  // 生日格式檢查
  let re = new RegExp("^([0-9]{4})[.-]{1}([0-9]{1,2})[.-]{1}([0-9]{1,2})$");
  let strDataValue;
  let infoValidation = true;
  if ((strDataValue = re.exec(birthday)) != null) {
    let i;
    i = parseFloat(strDataValue[1]);
    if (i <= 0 || i > 9999) { /*年*/
      infoValidation = false;
    }
    i = parseFloat(strDataValue[2]);
    if (i <= 0 || i > 12) { /*月*/
      infoValidation = false;
    }
    i = parseFloat(strDataValue[3]);
    if (i <= 0 || i > 31) { /*日*/
      infoValidation = false;
    }
  } else {
    infoValidation = false;
  }
  if (!moment(birthday, 'YYYY-MM-DD').isValid() || !infoValidation) {
    check = false;
    res.status(200).send({ status: 'Birthday wrong format' });
  }

  // 性別欄位檢查
  if (sex != 'Man' && sex != 'Ms') {
    check = false;
    res.status(200).send({ status: 'Sex wrong format' });
  }

  // 光明燈類型檢查
  if (light_type != 'An_Tai_Sui' && light_type != 'Bright_Lights' && light_type != 'Wenchang_Lamp' && light_type != 'Worship_The_Lantern') {
    check = false;
    res.status(200).send({ status: 'light_type wrong format' });
  }

  return check
}

// 是否有重複點燈檢查
function check_exist(res, api_name, user_id, name, birthday, sex, light_type) {
  connection.query("SELECT * FROM linebot.bright_lights_information WHERE user_id=? AND name=? AND birthday=? AND sex=? AND light_type=? ", [user_id, name, birthday, sex, light_type], function (err, row) {
    if (err) {
      console.log(err);
      push_splunk(api_name, 'FATAL', user_id, 'Error');
      res.status(200).send({ status: 'Not ok' });
    } else if (JSON.stringify(row) != '[]') {
      let msg = { status: 'Data exist' };
      push_splunk(api_name, 'INFO', user_id, msg);
      res.status(200).send(msg);
    } else {
      // 點光明燈
      bright_lights(res, api_name, user_id, name, birthday, sex, light_type);
    }
  });
}

// 點光明燈
function bright_lights(res, api_name, user_id, name, birthday, sex, light_type) {
  let data = {
    'user_id': user_id,
    'name': name,
    'birthday': birthday,
    'sex': sex,
    'light_type': light_type
  }

  connection.query("INSERT INTO linebot.bright_lights_information set ? ", data, function (err, row) {
    if (err) {
      console.log(err);
      push_splunk(api_name, 'FATAL', user_id, 'Error');
      res.status(200).send({ status: 'Not ok' });
    } else {
      push_splunk(api_name, 'INFO', user_id, data);
      res.status(200).send({ status: 'Ok' });
    }
  });
}

// 將event資料寫入
function event_write(res, api_name, event_type, source, timestamp, mode, message, user_id) {
  let data = {
    event_type: event_type,
    source: source,
    timestamp: timestamp,
    mode: mode,
    message: message
  }
  connection.query("INSERT INTO linebot.event set ? ", data, function (err, row) {
    if (err) {
      console.log(err);
      push_splunk(api_name, 'FATAL', user_id, 'Error');
      res.status(200).send({ status: 'Not ok' });
    } else {
      res.status(200).send({ status: 'Ok' });
    }
  });
}

// 搜尋最新消息
function news(res, api_name,user_id) {
  let reply_message = "";
  connection.query("SELECT * FROM linebot.news", function (err, row) {
    if (err) {
      console.log(err);
      push_splunk(api_name, 'FATAL', user_id, 'Error');
      res.status(200).send({ status: 'Not ok' });
    } else {
      for (let index = 0; index < row.length; index++) {
        reply_message = reply_message + row[index]['introduction'] + '\n' + row[index]['link'] + '\n' + row[index]['date'] + '\n\n';
      }
      reply_message = row[0]['title'] + '\n' + reply_message;
      res.status(200).send({ 'news': reply_message });
    }
  })
}

// 使用者是否有註冊過確認
function user_check(res, api_name,user_id){
  connection.query("SELECT * FROM linebot.user_information WHERE user_id=?", [user_id], function (err, row) {
    if (err) {
      console.log(err);
      push_splunk(api_name, 'FATAL', user_id, 'Error');
      res.status(200).send({ status: 'Not ok' });
    } else {
      if (row[0]) {
        res.status(200).send({ status: 'Exist' });
      } else {
        res.status(200).send({ status: 'Does Not Exist' });
      }
    }
  })
}

// 新增使用者資料-註冊
function user_add(res, api_name,user_id,name,birthday,sex){
  let data = {
    user_id: user_id,
    name: name,
    birthday: birthday,
    sex: sex
  }
  connection.query("INSERT INTO linebot.user_information set ? ", data, function (err, row) {
    if (err) {
      console.log(err);
      push_splunk(api_name, 'FATAL', user_id, 'Error');
      res.status(200).send({ status: 'Not ok' });
    } else {
      res.status(200).send({ status: 'Ok' });
    }
  });
}

// 尚未合成圖片搜尋
function query_light(res, api_name){
  connection.query("SELECT * FROM linebot.bright_lights_information WHERE status=0 ", function (err, row) {
    if (err) {
      console.log(err);
      push_splunk(api_name, 'FATAL', 'all', 'Error');
      res.status(200).send({ status: 'Not ok' });
    } else if (JSON.stringify(row) != '[]') {
      res.status(200).send({ 'id': row[0].id,'user_id':row[0].user_id,'name': row[0].name });
    }else{
      res.status(200).send('None');
    }
  });
}

// 點燈圖片合成完成
function light_up(res, api_name,user_id,id){
  let data = {
    'status':1
  }
  connection.query("UPDATE linebot.bright_lights_information set ? WHERE id = ? ", [data, id], function (err, row) {
    if (err) {
      push_splunk(api_name, 'FATAL', user_id, 'Error');
      res.status(200).send({ status: 'Not ok' });
    } else {
      res.status(200).send({ status: 'Ok' });
    }
  });
}

// 信徒資料查詢
function user_data(res, api_name,user_id) {
  connection.query("SELECT * FROM linebot.user_information WHERE user_id=? ", [user_id], function (err, row) {
    if (err) {
      console.log(err);
      push_splunk(api_name, 'FATAL', user_id, 'Error');
      res.status(200).send({ status: 'Not ok' });
    } else if (JSON.stringify(row) != '[]') {
      let msg = { 'name': row[0]['name'],'birthday': row[0]['birthday'], 'sex': row[0]['sex']};
      res.status(200).send(msg);
    } 
  });
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
  // 跨域的header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');

  // 主程式
  main(res, req);
};