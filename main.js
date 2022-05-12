var http = require('http');
var fs = require('fs');
var url = require('url');
const { title } = require('process');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html')

function control(title){
  const cleanTitle = sanitizeHtml(title)
  return `
    <a href="/create">create</a>
    <a href="/update?id=${cleanTitle}">update</a>
    <form action="delete_process" method="post">
      <input type='hidden' name='title' value='${cleanTitle}'>
      <input type='submit' value='delete'>
    </form>
    `}


var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = new URL('http://localhost:1234'+_url).searchParams
    let pathname = new URL('http://localhost:1234'+_url).pathname
    console.timeLog(pathname)
    if(pathname ==='/'){
      if (queryData.get('id') ===null){

        fs.readdir('./data',(err,filelist) =>{
          
          let title = 'Welcome'
          let data = 'hello, node.js';
          let list = template.list(filelist);
          let html = template.html(title,list,
          `<h2>${title}</h2>
          <p>${data}</p>`
          ,`<a href="/create">create</a>`);
          response.writeHead(200);
          response.end(html);
        })

        
      }else{
        const filterId = path.parse(queryData.get('id')).base
        fs.readFile(`data/${filterId}`,'utf8',(err,data) =>{
          fs.readdir('./data',(err,filelist) =>{
            let title = queryData.get('id');
            const cleanTitle = sanitizeHtml(title)
            const cleanData = sanitizeHtml(data)
            let list = template.list(filelist);
            let html = template.html(title,list,
            `<h2>${cleanTitle}</h2>
            <p>${cleanData}</p>`,control(title));
            response.writeHead(200);
            response.end(html);
          })
        })
      }
    
  }else if(pathname === '/create'){
    fs.readdir('./data',(err,filelist) =>{
      let title = 'WEB - create'
      let list = template.list(filelist);
      let html = template.html(title,list,`
          <form action="http://localhost:1234/create_process" method="post">
          <p><input type='text' name="title" placeholder="title"></p>
          <p>
            <textarea name="description" id="" cols="30" rows="10" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit" value="생성">
          </p>
        </form>
      `,'');
      response.writeHead(200);
      response.end(html);
    })
  }else if(pathname === '/create_process'){
    response.writeHead(200);
    let body = '';
    request.on('data',(data)=>{
      body += data;
    })
    request.on('end',()=>{
      let post = new URLSearchParams(body);
      console.log(post)
      let title = post.get('title')
      let description = post.get('description')
      const cleanTitle = sanitizeHtml(title)
      const cleanData = sanitizeHtml(description)
      fs.writeFile(`./data/${cleanTitle}`, cleanData,"utf8", function (err) {
        console.log('File is created successfully.');
        response.writeHead(302,{
          'Location': encodeURI(`/?id=${cleanTitle}`)
        })
        response.end()
      });
     
    });

    
  } else if(pathname === '/update'){
    const filterId = path.parse(queryData.get('id')).base
    fs.readFile(`data/${filterId}`,'utf8',(err,data) =>{
      fs.readdir('./data',(err,filelist) =>{
        let title = queryData.get('id');
        const cleanTitle = sanitizeHtml(title)
        const cleanData = sanitizeHtml(data)
        let list = template.list(filelist);
        let html = template.html(cleanTitle,list,'',`
          <form action="http://localhost:1234/update_process" method="post">
          <input type='hidden' name='id' value="${cleanTitle}">
          <p><input type='text' name="title" value="${cleanTitle}"></p>
          <p>
            <textarea name="description" id="" cols="30" rows="10" placeholder="description" >${cleanData}</textarea>
          </p>
          <p>
            <input type="submit" value="수정">
          </p>
          </form>
        `);
        response.writeHead(200);
        response.end(html);
      })
    })
  } else if(pathname === '/update_process'){
    response.writeHead(200);
    let body = '';
    request.on('data',(data)=>{
      body += data;
    })
    request.on('end',()=>{
      let post = new URLSearchParams(body);
      console.log(post)
      let id = post.get('id')
      let title = post.get('title')
      let description = post.get('description')
      // const cleanTitle = sanitizeHtml(title)
      // const cleanData = sanitizeHtml(description)
      fs.writeFile(`./data/${id}`, description,"utf8", function (err) {
        fs.rename(`./data/${id}`,`./data/${title}`,(err)=>{
          if(err){return err}
          else {console.log('file renamed')}
        })
        response.writeHead(302,{
          'Location': encodeURI(`/?id=${title}`)
        })
        response.end()
      });
    });
  } else if(pathname === '/delete_process'){
    response.writeHead(200);
    let body = ''
    request.on('data',(data)=>{
      body += data
    })
    request.on('end',()=>{
      let post = new URLSearchParams(body)
      const filterId = path.parse(post.get('title')).base
      fs.unlink(`data/${filterId}`,(err)=>{
        if(err) return err
        response.writeHead(302,{
          'Location': '/'
        })
        response.end()
      })
    })

  } else{
    response.writeHead(404);
    response.end('not found');
  }
    
    // console.log(__dirname + url)
    
    // response.end('zzki : ' + url);C:\Users\WR\Desktop\web\lifecode\node

 
});
app.listen(1234);