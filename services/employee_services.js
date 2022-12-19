const { query } = require('express');
const connection = require('./db');

//Get all employees
async function employees_list(res) {
    let selectQuery = 'SELECT * FROM Employee';    
    connection.query(selectQuery,function (err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
      });
}

// Get a single employee
async function get_employee(req,res) {
    let selectQuery = 'SELECT * FROM Employee WHERE id = ?';    
    connection.query(selectQuery,[req.params.id], function (err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
      });
}

// Create a Employee.
async function create_employee(req, res, next) {
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