import socket,json

def handler(request):
    host="163.18.26.108"
    port=request.json['port']
    msg=request.json['msg']
    data=bytes(json.dumps(msg),"utf-8")
    syslogSocket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    # 送出
    syslogSocket.sendto(data, (host, port))
    # 清除socket
    syslogSocket.close()
    return {"Status":"Ok"}