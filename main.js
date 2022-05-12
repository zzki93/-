var http = require('http');
var fs = require('fs');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html')
const mysql = require('mysql')

const db = mysql.createConnection({
  host:'localhost',
  user:'nodejs',
  password:'1234',
  database:'opentutorials'
})

db.connect();

function control(title){
  const cleanTitle = sanitizeHtml(title)
  return `
    <a href="/create">create</a>
    <a href="/update?id=${title}">update</a>
    <form action="delete_process" method="post">
      <input type='hidden' name='title' value='${title}'>
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

        db.query(`select * from topic`, (err,topics)=>{
          let title = 'Welcome'
          let data = 'hello, node.js';
          let list = template.list(topics);
          let html = template.html(title,list,
              `<h2>${title}</h2>
              <p>${data}</p>`
              ,`<a href="/create">create</a>`);
          response.writeHead(200)
          response.end(html)
        })

        
      }else{
        db.query('select * from topic',(err,topics)=>{
          if(err) throw err
          db.query(`select * from topic where id=?`,[queryData.get('id')],(err2,topic)=>{
            if(err2) throw err2
            const list = template.list(topics);
            const title = topic[0].title;
            const data = topic[0].description;
            const html = template.html(title,list,
              `<h2>${title}</h2>
              <p>${data}</p>`
              ,control(title));
              response.writeHead(200)
              response.end(html)
          })
          
        })
      }
    
  }else if(pathname === '/create'){
    db.query('select * from topic',(err,topics)=>{
      if(err) throw err
      db.query(`select * from topic where id=?`,[queryData.get('id')],(err2,topic)=>{
        if(err2) throw err2
        const title = 'WEB -Create';
        const list = template.list(topics);
        const html = template.html(title,list,`
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
          response.writeHead(200)
          response.end(html)
      })
    })
  }else if(pathname === '/create_process'){
    response.writeHead(200);
    let body = '';
    request.on('data',(data)=>{
      body += data;
    })
    request.on('end',()=>{
      const post = new URLSearchParams(body);
      console.log(post)
      const title = post.get('title')
      const description = post.get('description')
      db.query(`
      insert into topic (title, description, created, author_id)
       values (?, ?, NOW(), ?)`,
       [title,description,1],
       (err,result)=>{
        if(err) throw err;
        console.log(result)
        response.writeHead(302,{
          'Location': `/?id=${result.insertId}`
        })
        response.end()
      })
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
});
app.listen(1234);