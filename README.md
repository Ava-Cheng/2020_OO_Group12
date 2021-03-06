# 2020_OO_Group12
系統分析與設計課程




### 專題題目：觀音媽達康

### 專案組成
#### 組長：鄭育存
#### 組員：戴珮筑

### 分工表
|鄭育存|戴珮筑|
|:----:|:----:|
|系統架構/流程規劃與設計|介面設計|
|文件撰寫、PPT製作|文件撰寫、PPT製作|
|LineBot實作|數位光明燈實作|
|報告|報告|

---


### 專案起因：
台灣具有非常豐富的民間信仰文化。根據調查發現，全台的廟宇數高達「1 萬 2271 座」;居住在台灣的人民中，有宗教信仰的民眾高達「八成」，但一 間廟宇中通常只有 2 至 5 位廟公。在極少的人力之下卻需要處理許多廟宇事務、排解信徒疑難雜症等，使得大量的人力與時間成本被消耗，從而導致廟公沒有足夠時間處理眾多的廟宇事務，便十分不符合經濟效益，信徒也將無法在第一時間得知廟宇的最新消息。

另一方面，現代人礙於忙碌，較少時間能參與祭祀活動或是日常參拜。 因此本團隊將傳統廟宇加入數位科技元素，結合廟宇點平安燈習俗轉型為數位平安燈方式呈現。並將信徒會看農民曆的習慣，轉換為數位方式建置在Line Bot上，讓信徒更方便查閱。

### 專案介紹：
廟宇所提供的各種服務中，光明燈屬於多數人所熟捻之祈福活動，然而現代的年輕族群大多不懂複雜的點燈流程。因此本團隊在點燈系統中，採用簡化之點燈流程，讓點燈的信徒無需花費過長的時間點燈，並將傳統的功德箱轉變為電子支付方式，以便信徒捐獻功德金。傳統的光明燈不僅在管理上相當困難，更需要大量的空間來擺放。在這方面，我們採用信徒所捐獻之功德金區分光明燈「等級」，將以往「燈離神佛越近越靈」的概念轉化為功德金所區分的「等級」，依照此「等級」劃分燈號與螢幕的比例，並透過所開發之數位光明燈設備顯示於 LCD 螢幕上。
 
因顧及信奉民間信仰的各種不同族群，例如長青族在 Line 上經常採用語音留言的方式傳遞訊息，故需提供文字或語音留言的使用方法。另外採用雲端的特點在於方便管理系統所需之相關資料，並提供了完善的維運機制協助我們管理資料及程式。

綜上所述，本團隊希望結合傳統民間信仰以及聊天機器人(Chat Bot)，並且運用自然語言處理技術建構出一套虛擬廟公系統——「觀音媽達康」，使聊天機器人作為廟公虛擬代理人。以期所製作之系統能代替廟公自動回覆日常之結構化問題，且能根據各廟宇所定之祭拜日期推播資訊，減低廟公處理事務之人力與時間成本。信徒也能利用「觀音媽達康」點數位光明燈，並獲取即時的祭拜消息及查閱農民曆資訊。

---

### 甘特圖：
![](https://i.imgur.com/pZmwTD3.png)

### PERT/CPM圖：

![](https://i.imgur.com/DdyZKVY.png)

---

## 功能性需求與非功能性需求
#### 功能性需求：
* 最新消息：提供信徒關於廟宇相關的最新消息，包含廟會活動、點光明燈時程、普渡事項等等事項公告。
* 數位農民曆：將傳統農民曆，轉換為數位化的形式。列出每日宜、不宜的事項，供有需要的信徒參考使用。
* 信徒問答：以關鍵字的方式，會在後端抓取相關關鍵字，並做相對應的答覆。以回答信徒日常問題，減低廟公日常工作負擔。
* 數位光明燈：將傳統的點光明燈流程變成數位化的方式，首先一樣會填寫基本資料，接下來可以選擇預想點的光明燈種類，就可以依照信徒心意捐獻功德金，再來我們會幫信徒客製化成一張專屬信徒的圖片，播放至神明面前LCD螢幕中，達到跟神明互動的效果。
* 人員管理：管理信徒、廟公資料。
* 活動特區：用來針對不同時期不同活動，所特設專區，甚至可以做活動的互動，Ex.刮刮樂。
#### 非功能性需求：
* 反應時間(response time) ：提供使用者相關Line Bot觸發事件，須花費之時間約在1-4秒內完成。
* 使用性(usability)：年輕人Line使用率極高，能夠快速上手。對於老年人來說，可能比較不適應跟陌生，可能需要年輕人從旁指導，但約10分鐘內可以輕鬆上手。
* 可靠度(reliability)：系統將建置雲服務當中，會有相當良好的維運機制，可用性高達99.999%。
* 效能(performance)：Line Bot及相關平台應同時提供約1,000人以上上線使用。
* 維護性(maintainability)：coding style會遵循pep8使用規範、Git管理部分git commit 會遵循feat、fix等相關通用的type型態紀錄其commit。

---

### 功能分解圖(functional decomposition diagram, FDD)：
![](https://i.imgur.com/tauwaKP.png)

---

# 需求分析描述：
觀音媽達康系統的需求分析簡述如下：    
（1）信徒或廟公透過點選最新消息，取得廟宇最新公告消息。    
（2）信徒或廟公可以透過數位農民曆查詢每日宜、不宜事項，供參考使用。    
（3）信徒可以透過文字對話的方式，詢問關於廟宇歷史、禁忌等相關問題。    
（4）廟公可以透過登入機制，獲得回覆信徒訊息等廟公專屬功能。    
（5）信徒可以透過登入/註冊機制，獲取光明燈、活動專區的功能。    
（6）任何人註冊/登入必須更新紀錄於資料庫。    
（7）信徒透過活動特區，取得近期活動的相關遊戲，Ex.刮刮樂遊戲。    
（8）信徒預想點光明燈需要填寫相關個人基本資料。    
（9）信徒填寫完個人基本資料後，即可選擇光明燈類型。    
（10）信徒選擇完光明燈類型，即可串接金流，依照心意捐獻功德金。    
（11）任何人點光明燈必須更新紀錄於資料庫。    
（12）完成信徒個人資料填寫、光明燈類型選擇、功德金捐獻以上三項後，後端便會開始處理信徒名字＋光明燈圖片合成。    
（13）將其合成完信徒光明燈之圖片，推送至神明面前LCD螢幕，及推送完成訊息到信徒Line Bot。    

---

### 使用案例圖與使用案例說明：
#### 使用案例圖：
![](https://i.imgur.com/TMFiRvE.png)


#### 使用案例說明：
|使用案例名稱|人員管理|
|--- |--- |
|行動者|信徒、廟公|
|說明|描述人員資訊的紀錄流程，並功能解鎖|
|完成動作|1.點選註冊。<br>2.填寫基本資料。<br>3.點選登入。<br>4.登入成功。<br>5.依照身分解鎖功能。|
|替代方案|1.點選註冊。<br>2.填寫基本資料。<br>3.點選登入。<br>4.登入失敗。<br>4.返回註冊頁面。|
|先決條件|填寫基本資料並完成註冊|
|後置條件|註冊完成，信徒可以登入並依照身份解鎖功能|
|假設|無|

|使用案例名稱|數位光明燈|
|--- |--- |
|行動者|信徒|
|說明|描述點數位光明燈流程|
|完成動作|1.填寫信徒基本資料。<br>2.選擇光明燈類型。<br>3.捐獻功德金。<br>4.文字跟圖像合成。<br>5.同時推送完成訊息及推送圖像。<br>6.查詢光明燈。|
|替代方案|1.填寫信徒基本資料。<br>2.選擇光明燈類型。<br>3.捐獻功德金。<br>4.line pay支付失敗。<br>5.返回付款失敗錯誤訊息。<br>6.返回付款頁面。|
|先決條件|填寫基本資料並選擇光明燈類型及捐獻功德金|
|後置條件|影像跟文字合成並推送|
|假設|無|

|使用案例名稱|信徒問答|
|--- |--- |
|行動者|信徒|
|說明|描述信徒跟機器人對話過程|
|完成動作|1.傳送問題。<br>2.針對關鍵字搜尋答案。<br>3.返回相對應的問題答案。|
|替代方案|1.傳送問題。<br>2.針對關鍵字搜尋答案。<br>3.沒有相關問題答案。<br>4.返回聽不懂訊息，請信徒再問一次。|
|先決條件|文字方式傳送，並問題中有關鍵字|
|後置條件|返回針對關鍵字相對應答案|
|假設|以文字方式傳送問題|

|使用案例名稱|活動特區|
|--- |--- |
|行動者|信徒、廟公|
|說明|顯示近期廟宇活動資訊或活動的互動遊戲|
|完成動作|1.進入廟宇活動專區。<br>2.點選有興趣的廟宇活動。<br>3.顯示活動資訊。|
|替代方案|1.進入廟宇活動專區。<br>2.點選有興趣的廟宇活動。<br>3.活動結束。<br>5.返回結束訊息。|
|先決條件|點選廟宇活動專區|
|後置條件|顯示廟宇活動專區頁面，並顯示相對應活動進行互動|
|假設|無|

|使用案例名稱|數位農民曆|
|--- |--- |
|行動者|信徒|
|說明|以數位方式觀看農民曆|
|完成動作|1.數位農民曆查看|
|替代方案|1.數位農民曆查看。<br>2.網路不穩讀取失敗。<br>3.返回Error訊息。|
|先決條件|點選數位農民曆|
|後置條件|顯示數位農民曆頁面|
|假設|無|

|使用案例名稱|最新消息|
|--- |--- |
|行動者|信徒、廟公|
|說明|查看最新消息|
|完成動作|1.最新消息查看|
|替代方案|1.最新消息查看<br>2.網路不穩讀取失敗。<br>3.返回Error訊息。|
|先決條件|點選最新消息|
|後置條件|顯示最新消息公告頁面|
|假設|無|

---

### DFD圖
#### 系統環境圖 (DFD)
![](https://i.imgur.com/xg6tjTK.png)


#### 繪製DFD 圖0
![](https://i.imgur.com/ecr39qB.png)

---

### UML 類別圖(class Diagram)
![](https://i.imgur.com/vDZoW5b.png)


### 循序圖與活動圖 (須至少有三項以上的使用案例，每個使用案例一個循序圖與活動圖)
#### 人員管理
##### 循序圖
![](https://i.imgur.com/aEBZ0Hg.png)

##### 活動圖
![](https://i.imgur.com/5bOUMOo.png)

#### 信徒問答
##### 循序圖
![](https://i.imgur.com/r5fU6Cs.png)
##### 活動圖
![](https://i.imgur.com/wSy63Xz.png)

#### 數位農民曆
##### 循序圖
![](https://i.imgur.com/rqj44nN.png)

##### 活動圖
![](https://i.imgur.com/LwQtjCD.png)

---

### 分鏡板(storyboard) 的形式向使用者展示初始的螢幕設計:
* 可以利用手繪或軟體繪製
* 清楚標示所有輸入的欄位之資料型態與驗證規則
* 列出所有螢幕與報表列印的欄位之名稱與功能
![](https://i.imgur.com/J0BVLZ9.png)
![](https://i.imgur.com/n8exJjm.png)
![](https://i.imgur.com/d4fZiqk.png)
![](https://i.imgur.com/pu6a599.png)
![](https://i.imgur.com/fX1n5iZ.png)
![](https://i.imgur.com/h80gLef.png)
![](https://i.imgur.com/WGIl1td.png)
![](https://i.imgur.com/b3ammPh.png)
![](https://i.imgur.com/Jz0kVvY.png)
![](https://i.imgur.com/ZbGiPUR.png)
![](https://i.imgur.com/vfHGtQq.png)
![](https://i.imgur.com/RzwSqJR.png)
![](https://i.imgur.com/w6bnzZ1.png)
![](https://i.imgur.com/UCYZclH.png)
![](https://i.imgur.com/anD7B8A.png)
![](https://i.imgur.com/R4atgw1.png)


---

### 實體關係圖(entity-relationship diagram, ERD)
![](https://i.imgur.com/tpoozp7.jpg)
