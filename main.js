var http = require('http');
const template = require('./lib/template.js');
const db = require('./lib/db')

var app = http.createServer(function(request,response){
    const _url = request.url;
    const queryData = new URL('http://localhost:1234'+_url).searchParams
    const pathname = new URL('http://localhost:1234'+_url).pathname
    
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
          db.query(`select * from topic left join author on topic.author_id=author.id where topic.id=?`,[queryData.get('id')],(err2,topic)=>{
            if(err2) throw err2
            console.log(topic)
            const list = template.list(topics);
            const title = topic[0].title;
            const data = topic[0].description;
            const html = template.html(title,list,
              `<h2>${title}</h2>
              <p>${data}</p>
              <p>by ${topic[0].name}</p>
              `
              ,`
              <a href="/create">create</a>
              <a href="/update?id=${queryData.get('id')}">update</a>
              <form action="delete_process" method="post">
                <input type='hidden' name='id' value='${queryData.get('id')}'>
                <input type='submit' value='delete'>
              </form>
              `);
              response.writeHead(200)
              response.end(html)
          })
          
        })
      }
    
  }else if(pathname === '/create'){
    db.query('select * from topic',(err,topics)=>{
      if(err) throw err
      db.query('select * from author',(err,authors)=>{
        
        const title = 'WEB - Create';
        const list = template.list(topics);
        const html = template.html(title,list,`
          <form action="http://localhost:1234/create_process" method="post">
          <p><input type='text' name="title" placeholder="title"></p>
          <p>
            <textarea name="description" id="" cols="30" rows="10" placeholder="description"></textarea>
          </p>
            ${template.authorSelect(authors)}
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
      const authorId= post.get('author')
      db.query(`
      insert into topic (title, description, created, author_id)
       values (?, ?, NOW(), ?)`,
       [title,description,authorId],
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
    db.query('select * from topic',(err,topics)=>{
      if(err) throw err
      db.query(`select * from topic where id=?`,[queryData.get('id')],(err2,topic)=>{
        if(err2) throw err2
        db.query('select * from author',(err,authors)=>{
          const title = topic[0].title;
          const list = template.list(topics);
          const data = topic[0].description;
          const html = template.html(title,list,
            `
            <form action="http://localhost:1234/update_process" method="post">
            <input type='hidden' name='id' value="${topic[0].id}">
            <p><input type='text' name="title" value="${title}"></p>
            <p>
              <textarea name="description" id="" cols="30" rows="10" placeholder="description" >${data}</textarea>
            </p>
              ${template.authorSelect(authors,topic[0].author_Id)}
            <p>
              <input type="submit" value="수정">
            </p>
            </form>
            `
            ,'');
          response.writeHead(200)
          response.end(html)
        })
      })
    })
  } else if(pathname === '/update_process'){
    response.writeHead(200);
    let body = '';
    request.on('data',(data)=>{
      body += data;
    })
    request.on('end',()=>{
      const post = new URLSearchParams(body);
      const id = post.get('id')
      const title = post.get('title')
      const description = post.get('description')
      const authorId = post.get('author')
      db.query('update topic set title=?, description=?, author_id=? where id = ?',[title,description,authorId,id],(err,result)=>{
        if(err){console.log(err)}
        response.writeHead(302,{
          'Location': `/?id=${id}`
        })
        response.end();
      })
    });
  } else if(pathname === '/delete_process'){
    response.writeHead(200);
    let body = ''
    request.on('data',(data)=>{
      body += data
    })
    request.on('end',()=>{
      let post = new URLSearchParams(body)
      db.query('DELETE from topic where id=?',[post.get('id')],(err,result)=>{
        if(err){throw err}
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