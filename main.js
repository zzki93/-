var http = require('http');
var fs = require('fs');
var url = require('url');
const { title } = require('process');

function getList(filelist){
  let pageList = '<ul>';
  let i = 0 ;
  while(i<filelist.length){
    pageList = pageList +`
    <li>
      <a href="/?id=${filelist[i]}">${filelist[i]}</a>
    </li>
    `
    
    i++;
  }
  pageList = pageList + '</ul>';
  return pageList;
}

function getTemplateHtml(title,list,body){
  return  `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    <a href="/create">create</a>
    <h2>${title}</h2>
    <p>${body}</p>
  </body>
  </html>
`
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = new URL('http://localhost:3000'+_url).searchParams
    let pathname = new URL('http://localhost:3000'+_url).pathname
    console.timeLog(pathname)
    if(pathname ==='/'){
      if (queryData.get('id') ===null){

        fs.readdir('./data',(err,filelist) =>{
          
          let title = 'Welcome'
          let list = getList(filelist);
          data = 'hello, node.js';
          let template = getTemplateHtml(title,list,data);
          response.writeHead(200);
          response.end(template);
        })

        
      }
    fs.readFile(`data/${queryData.get('id')}`,'utf8',(err,data) =>{
      fs.readdir('./data',(err,filelist) =>{
        let title = queryData.get('id');
        let list = getList(filelist);
        let template = getTemplateHtml(title,list,data);
        response.writeHead(200);
        response.end(template);
      })
    })
  }else if(pathname === '/create'){
    fs.readdir('./data',(err,filelist) =>{
      let title = 'WEB - create'
      let list = getList(filelist);
      let template = getTemplateHtml(title,list,`
          <form action="http://localhost:1234/create_process" method="post">
          <p><input type='text' name="title" placeholder="title"></p>
          <p>
            <textarea name="description" id="" cols="30" rows="10" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
      `);
      response.writeHead(200);
      response.end(template);
    })
  }else if(pathname === '/create_process'){
    response.writeHead(200);
    let body = '';
    request.on('data',(data)=>{
      body += data;
    })
    request.on('end',()=>{
      let post = new URLSearchParams(body);
      fs.writeFile(`data/${post.get('title')}`, post.get('description'), function (err) {
        if (err) throw err;
        response.end(alert('저장되었습니다.'));
      });

    })
  } else{
    response.writeHead(404);
    response.end('not found');
  }
    
    // console.log(__dirname + url)
    
    // response.end('zzki : ' + url);

 
});
app.listen(1234);