from flask import render_template
from urllib.parse import urlparse
from urllib.parse import parse_qs
from urllib import parse
import os


def handler(request):
    liff_url='https://liff.line.me/1655540797-Y7LJX3ZP'
    DB_proxy='https://asia-east2-guanyin-mother-300200.cloudfunctions.net/DB_proxy'
    bright_lights='https://asia-east2-guanyin-mother-300200.cloudfunctions.net/bright_lights'
    images_url='https://storage.googleapis.com/liff_static/images/'
    if urlparse(request.url).query[11:27]=='%3Fpageid%3Dnews':
        # 最新消息
        return render_template('news.html',gsc_url=os.getenv("gsc_url"),liff_url=liff_url)
    elif urlparse(request.url).query[11:28]=='%3Fpageid%3Dnew_1':
        # 最新消息-1
        return render_template('new_1.html',gsc_url=os.getenv("gsc_url"))
    elif urlparse(request.url).query[11:33]=='%3Fpageid%3Dregistered':
        # 註冊頁面
        return render_template('registered.html',gsc_url=os.getenv("gsc_url"),userid=urlparse(request.url).query[46:79],DB_proxy=DB_proxy)
    elif urlparse(request.url).query[11:32]=='%3Fpageid%3Duser_data':
        # 個人資料
        name = parse.unquote(parse.unquote(urlparse(request.url).query[94:150]))
        birthday = urlparse(request.url).query[46:56]
        # 性別判斷
        if urlparse(request.url).query[83:84]=='1':
            sex='女'
        else:
            sex='男'
        # 個人資料頁面
        return render_template('user_data.html',gsc_url=os.getenv("gsc_url"),name=name,sex=sex,birthday=birthday)
    elif urlparse(request.url).query[11:36]=='%3Fpageid%3Dbright_lights':
        # 光明燈首頁
        return render_template('index_light.html',gsc_url=os.getenv("gsc_url"),userid=urlparse(request.url).query[49:82])
    elif urlparse(request.url).query[7:19]=='select_light':
        # 光明燈類型選擇頁面
        return render_template('select_light.html',gsc_url=os.getenv("gsc_url"),userid=urlparse(request.url).query[28:61],bright_lights=bright_lights)
    elif urlparse(request.url).query[11:31]=='%3Fpageid%3Dcalendar':
        # 數位農民曆頁面
        return render_template('calendar.html',gsc_url=os.getenv("gsc_url"),images_url=images_url)