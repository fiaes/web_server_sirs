const { query } = require('express');
const connection = require('./db');

//Get all employees
async function employees_list() {
    if(err) throw err;
    let selectQuery = 'SELECT * FROM Employee';    
    connection.query(selectQuery,function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      });
}

// Get a single employee
async function get_employee(id) {
    if(err) throw err;
    let selectQuery = 'SELECT * FROM Employee WHERE id = ?';    
    connection.query(selectQuery,[id], function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      });
}

// Create a Employee.
async function create_employee(req, res, next) {
    if (err) throw err;
    var selectQuery = "INSERT INTO Employee (username, nome, password, roleID) VALUES (?, ?, ?, ?)";
    var params = [req.body.username, req.body.nome, req.body.password, req.body.roleID]
    connection.query(selectQuery,params, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
      });
};

module.exports = {
    employees_list,
    get_employee,
    create_employee
}