let bright_lights_img = new Array();
let i=0;
let k=1;

//設定每5秒執行一次
setInterval("all_file_name()",5000);
//設定每10秒執行一次
setInterval("sequentialImg()",10000);

function sequentialImg(){  //循序播放
    let img_len = bright_lights_img.length;// 圖檔數量
    if(img_len==1){
        document.getElementById("bright_lights").innerHTML  = "<img src='"+bright_lights_img[i]+"' width=488 height=628>";       
        i++;
        if(i>=img_len) i=0;
    }else if(img_len>1){
        document.getElementById("bright_lights").innerHTML  = "<img src='"+bright_lights_img[i]+"' width=488 height=628>"+"&nbsp;&nbsp;&nbsp;&nbsp;"+"<img src='"+bright_lights_img[k]+"' width=488 height=628>";       
        k=k+2;
        i=i+2;
        if(i>=img_len) i=0;
        if(k>=img_len) k=1; 
    }
}

function all_file_name(){
    let read_file_name='http://ava:8888/read_file_name';
    fetch(read_file_name,{
        method: 'GET'
    })
    .then((response) => response.json())
    .then((responseData) => {
        bright_lights_img = [];
        for(let i=0;i<responseData['all_file_list'].length;i++){
            bright_lights_img.push(responseData['all_file_list'][i]);
        }
        return bright_lights_img
    })
    .catch((error) => {
        console.log(error);
    })
}