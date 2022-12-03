const db = require('./db');
const config = require('./config');

async function getValues(){
  const rows = await db.query('SELECT * FROM users;');
  return rows
}
module.exports = {
  getValues
}


