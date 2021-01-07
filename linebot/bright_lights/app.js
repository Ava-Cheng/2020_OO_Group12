let fetch = require('node-fetch');
let fs = require('fs');
let moment = require('moment');
let ini = require('ini');
let config = ini.parse(fs.readFileSync('./config/config.ini', 'utf8'));

function main(res, req) {
  let api_name = 'bright_lights';
  let user_id = req.body.user_id;
  let name = req.body.name;
  let birthday = req.body.birthday;
  let sex = req.body.sex;
  let light_type = req.body.light_type;

  // 光明燈資料寫入
  bright_lights(res, api_name, user_id, name, birthday, sex, light_type);
}

// 光明燈資料寫入
function bright_lights(res, api_name, user_id, name, birthday, sex, light_type) {
  let data = {
    'api_name': api_name,
    'user_id': user_id,
    'name': name,
    'birthday': birthday,
    'sex': sex,
    'light_type': light_type
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
    .then((responseData) => {
      push_splunk(api_name, 'INFO', user_id, JSON.parse(JSON.stringify(data)));
      res.status(200).send({ 'status': responseData });
    })
    .catch(
      (error) => {
        console.log(error);
        push_splunk(api_name, 'CRITICAL', user_id, 'Error');
      }
    )
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
        console.log('Error:', 'Error');
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