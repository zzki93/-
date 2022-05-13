const mysql = require('mysql')

const db = mysql.createConnection({
  host:'localhost',
  user:'nodejs',
  password:'1234',
  database:'opentutorials'
})

db.connect();
module.exports = db;
