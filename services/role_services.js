const { query } = require('express');
const connection = require('./db');

//Get all roles
async function roles_list(res) {
    let selectQuery = 'SELECT * FROM Role';
    connection.query(selectQuery, function(err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    });
}

// Get a single role
async function get_role(req, res) {
    let selectQuery = 'SELECT * FROM Role WHERE id = ?';
    connection.query(selectQuery, [req.params.id], function(err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    });
}

// Create a role
async function create_role(req, res, next) {
    var selectQuery = "INSERT INTO Role (tipo) VALUES (?)";
    var params = [req.body.tipo]
    connection.query(selectQuery, params, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
};

module.exports = {
    roles_list,
    get_role,
    create_role
}