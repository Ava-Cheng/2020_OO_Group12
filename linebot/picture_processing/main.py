#!/usr/local/bin/python3.6
# -*- coding: utf-8 -*-
from flask import Flask, request, render_template
from configparser import ConfigParser
from PIL import Image
import pygame
import os
import glob
import requests
   
app = Flask(__name__)


# 讀取設定檔案
cfg = ConfigParser()
cfg.read(['./config/main.ini'])

# 光明燈照片處理
@app.route('/', methods=['GET', 'POST'])
def handler():
    if request.method == 'POST':
        file_name = request.json['id']
        name = request.json['name']
        user_id = request.json['user_id']
        name_len = len(str(name))

        # 判斷字數是否符合限制
        if name_len != 2 and name_len != 3 and name_len != 4 and name_len != 5:
            return {'status':'Not ok'}
        else:
            # 步驟一：信徒名字文字轉圖片
            text_to_picture(file_name,name,name_len)
            # 步驟二：圖片合成
            picture_synthesis(file_name,name)
            # 更新DB狀態
            data = {'api_name':'light_up','user_id':user_id,'id':file_name}
            requests.post(cfg['api_url']['DB_proxy'], json=data)
            return {'status':'Ok'}
    else:
        return render_template('index.html')

# 讀取檔名
@app.route('/read_file_name', methods=['GET'])
def read_file_name():
    all_file_list=sorted(glob.glob('./static/images/' + '*.png'))
    return {'all_file_list':all_file_list}

# 文字轉圖片
def text_to_picture(file_name,name,name_len):
    pygame.init()
    #設定視窗
    width, height = 698, 898
    # screen = pygame.display.set_mode((width, height))
    #建立畫布bg
    bg = pygame.Surface((width, height))
    # bg = bg.convert()
    bg.fill((255, 255, 255))  # 白色
    # 待轉換文字
    text = str(name)
    # 設定字型和字號
    # mac
    font_type = 'stxihei'

    if (name_len == 2) or (name_len == 3):
        font_size = 120
    elif name_len == 4:
        font_size = 100
    elif name_len == 5:
        font_size = 86

    font = pygame.font.SysFont(font_type, font_size)
    #渲染圖片，設定背景顏色和字型樣式,前面的顏色是字型顏色
    font_text = font.render(text, True, (0, 0, 0))

    if (name_len == 2):
        bg.blit(font_text, (230, 680))
    elif (name_len == 3):
        bg.blit(font_text, (172, 680))
    elif name_len == 4:
        bg.blit(font_text, (148, 680))
    elif name_len == 5:
        bg.blit(font_text, (142, 680))

    #儲存圖片
    pygame.image.save(bg, os.path.join('.', 'static', 'images', str(file_name) + '_' + str(name) + '.png'))#圖片儲存地址

# 圖片合成
def picture_synthesis(file_name,name):
    # 姓名圖片
    img1 = Image.open(os.path.join('.', 'static', 'images', str(file_name) + '_' + str(name) + '.png'))
    img1 = img1.convert('RGBA')
    # 光明燈圖片
    img2 = Image.open(os.path.join('.', 'static', 'images', 'tmp', 'light.jpg'))
    img2 = img2.convert('RGBA')
    
    r, g, b, alpha = img2.split()
    alpha = alpha.point(lambda i: i > 0 and 204)
    img = Image.composite(img2, img1, alpha)
    img.show()
    #儲存新的照片
    img.save(os.path.join('.', 'static', 'images', str(file_name) + '_' + str(name) + '.png'))

    return

if __name__ == '__main__':
    app.run(host='0.0.0.0',port='8888',debug=False)
