var express = require('express');
var router = express.Router();

// Require our controllers.
var client_service = require('../services/client_services');
var employee_service = require('../services/employee_services');
var contract_service = require('../services/contract_services');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

// GET request for list of clients 
router.get('/clients', client_service.clients_list);

//GET request for a client
router.get('/client/:id', client_service.get_client);

// POST request for creating a client
router.post('/clients', client_service.create_client);
//---------------------------------------------------------
// GET request for list of employees 
router.get('/employees', employee_service.employees_list);

//GET request for a employee
router.get('/employee/:id', employee_service.get_employee);

// POST request for creating a employee
router.post('/employees', employee_service.create_employee);
//---------------------------------------------------------
// GET request for list of contracts 
router.get('/contracts', contract_service.contracts_list);

//GET request for a contract
router.get('/contract/:id', contract_service.get_contract);

// POST request for creating a contract
router.post('/contracts', contract_service.create_contract);
//--------------------------------------------------------


module.exports = router;
