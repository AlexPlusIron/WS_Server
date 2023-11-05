const http = require('http');
const WebSocket = require('ws');
const request = require('request');

const keywords = {
  'car': ['https://www.drive2.ru/experience/volvo/g4822', 
          'https://www.drive2.ru/experience/landrover/g592', 
          'https://www.drive2.ru/experience/bmw/g602645073036839593'],
  'moto': ['https://moto-magazine.ru/tests/benelli/pol-litrovyy-lvyenok/', 
          'https://moto-magazine.ru/community/travel/zheleznyy-zad-1700-kilometrov-za-den-na-kitaytse/', 
          'https://moto-magazine.ru/tests/shiny/sportivnaya-versiya-test-shin-metzeler-roadtec-01-se/'],
  'boat': ['https://old.katera.ru/rssnews/20389', 
          'https://old.katera.ru/feed_item/o-dostupnosti-beregovoy-polosy-vodoemov-obshchego-polzovaniya', 
          'https://old.katera.ru/feed_item/elektrokatamaran'],    
// Другие ключевые слова и URL
};

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
 
  ws.on('message', message => {
    console.log(`Received message: ${message}`);
    const data = JSON.parse(message);
  
     if (data.type == 'keyword') {
      console.log(data.type);
      const keyword = data.keyword;
      const urls = keywords[keyword];

      if (urls) {
        ws.send(JSON.stringify(urls));
      } else {
        ws.send(JSON.stringify(new String('empty')));
      }

    
    } else if (data.type == 'download') {
      console.log(data.type);
      const url = data.url;
      console.log(url);
      console.log('Вызов функции скачивания');
      downloadContent(url, (error, content) => {
        if (error) {
          console.error(`Ошибка при скачивании ${url}: ${error}`);
          return;
        }

        const response_download = {
          type: 'content',
          url: url,
          content: content
        };
        
        ws.send(JSON.stringify(response_download));
      });
    }
  });
});

function downloadContent(url, callback) {
  request(url, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      callback(error || new Error(`Ошибка ${response.statusCode} при скачивании ${url}`));
      return;
    }

    callback(null, body);
  });
}

server.listen(8080, () => {
  console.log('WebSocket server started');
});



