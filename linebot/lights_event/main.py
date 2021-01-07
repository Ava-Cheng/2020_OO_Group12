#!/usr/local/bin/python3.6
# -*- coding: utf-8 -*-
from configparser import ConfigParser
import requests
import json

# 讀取設定檔案
cfg = ConfigParser()
cfg.read(['./config/main.ini'])

# 搜尋是否有尚未合成的
data = {'api_name':'query_light'}
response = requests.post(cfg['api_url']['DB_proxy'], json=data)

# 有尚未合成的要進行合成
if response.text!='None':
    user_id = response.json()['user_id']
    id_num = response.json()['id']
    name = response.json()['name']
    data = {'user_id':user_id,'id':id_num,'name':name}
    requests.post(cfg['api_url']['picture_processing'], json=data)
