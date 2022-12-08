var express = require('express');
var router = express.Router();

// Require our controllers.
var client_service = require('../services/client_services');
var employee_service = require('../services/employee_services');
var contract_service = require('../services/contract_services');
var rate_service = require('../services/rate_services');
var appliance_service = require('../services/appliance_services');
var appliance_consumption_service = require('../services/appliance_consumption_services');
var role_service = require('../services/role_services');

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
// GET request for list of rates 
router.get('/rates', rate_service.rates_list);

//GET request for a rate
router.get('/rate/:id', rate_service.get_rate);

// POST request for creating a rate
router.post('/rates', rate_service.create_rate);
//--------------------------------------------------------
// GET request for list of appliances 
router.get('/appliances', appliance_service.appliances_list);

//GET request for a appliance
router.get('/appliance/:id', appliance_service.get_appliance);

// POST request for creating a appliance
router.post('/appliances', appliance_service.create_appliance);
//--------------------------------------------------------
// GET request for list of appliance_consumptions 
router.get('/consumptions', appliance_consumption_service.consumptions_list);

//GET request for a appliance_consumption
router.get('/consumption/:id', appliance_consumption_service.get_consumption);

// POST request for creating a appliance_consumption
router.post('/consumptions', appliance_consumption_service.create_consumption);
//--------------------------------------------------------
// GET request for list of roles 
router.get('/roles', role_service.roles_list);

//GET request for a role
router.get('/role/:id', role_service.get_role);

// POST request for creating a role
router.post('/roles', role_service.create_role);
//--------------------------------------------------------

module.exports = router;