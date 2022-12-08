const { query } = require('express');
const connection = require('./db');

//Get all roles
async function roles_list() {
    let selectQuery = 'SELECT * FROM Rates';
    connection.query(selectQuery, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
}

// Get a single role
async function get_role(id) {
    let selectQuery = 'SELECT * FROM Rates WHERE id = ?';
    connection.query(selectQuery, [id], function(err, result, fields) {
        if (err) throw err;
        console.log(result);
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