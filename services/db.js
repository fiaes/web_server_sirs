/*
const mysql = require('mysql2');
const config = require('../config');
const connection = mysql.createConnection(config)

module.exports = connection;
*/
const mysql = require('mysql2/promise');
const config = require('../config');

async function query(sql, params) {
    const connection = await mysql.createConnection(config.db);
    const [results, ] = await connection.execute(sql, params);

    return results;
}

module.exports = {
    query
}