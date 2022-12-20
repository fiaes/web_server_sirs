const { query } = require('express');
const connection = require('./db');
const utils = require('./utils');

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
    if(isNaN(Number([req.params.id]))) {
        return res.status(400).json({ err: "Numbers only, please!"})
    }
    let selectQuery = 'SELECT * FROM Employee WHERE id = ?';    
    connection.query(selectQuery,[req.params.id], function (err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
      });
}

// Create a Employee.
async function create_employee(req, res, next) {
    var params = [req.body.username, req.body.nome, req.body.password, req.body.roleID];
    if(!utils.validate_input(params))
        return res.status(400).json({ err: "Invalid input! (Only numbers, letters and space)"});
    var selectQuery = "INSERT INTO Employee (username, nome, password, roleID) VALUES (?, ?, ?, ?)";
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