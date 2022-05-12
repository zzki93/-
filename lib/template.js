
module.exports = {
  html: function(title,list,body, control){
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
      ${control}
      ${body}
    </body>
    </html>
  `
  },
  list: function(topics){
    let pageList = '<ul>';
    let i = 0 ;
    while(i<topics.length){
      pageList = pageList +`
      <li>
        <a href="/?id=${topics[i].id}">${topics[i].title}</a>
      </li>
      `
      i++;
    }
    pageList = pageList + '</ul>';
    return pageList;
  }
}
