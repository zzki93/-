
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
  list: function(filelist){
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
}
