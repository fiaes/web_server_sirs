const { query } = require('express');
const db = require('./db');
const helper = require('../helper');
const config = require('../config');

//Get all clients
async function clients_list() {
    const offset = helper.getOffset(page, config.listPerPage);
    const rows = await db.query(
        'SELECT * FROM Client LIMIT ${offset},${config.listPerPage}'
    );
    const data = helper.emptyOrRows(rows);
    const meta = { page };

    return {
        data,
        meta
    }
}

// Get a single client
async function get_client(id) {
    let selectQuery = 'SELECT * FROM Client WHERE id = ?';
    connection.query(selectQuery, [id.params.id], function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
}

// Create a Client.
async function create_client(req, res, next) {
    var selectQuery = "INSERT INTO Client (username, nome, password, morada) VALUES (?, ?, ?, ?)";
    var params = [req.body.username, req.body.nome, req.body.password, req.body.morada]
    connection.query(selectQuery, params, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
};

module.exports = {
    clients_list,
    get_client,
    create_client
}