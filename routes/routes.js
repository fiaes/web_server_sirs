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
var signup_service = require('../services/signup_services');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
// GET request for list of clients 
router.get('/clients', (req, res) => {
    client_service.clients_list(res);
});
//GET request for a client
router.get('/client/:id', (req, res) => {
    client_service.get_client(req, res);
});
// POST request for creating a client
router.post('/clients', client_service.create_client);
//---------------------------------------------------------
// GET request for list of employees 
router.get('/employees', (req, res) => {
    employee_service.employees_list(res);
});
//GET request for a employee
router.get('/employee/:id', (req, res) => {
    employee_service.get_employee(req, res);
});
// POST request for creating a employee
router.post('/employees', employee_service.create_employee);
//---------------------------------------------------------
// GET request for list of contracts 
router.get('/contracts', (req, res) => {
    contract_service.contracts_list(res);
});
//GET request for a contract
router.get('/contract/:id', (req, res) => {
    contract_service.get_contract(req,res);
});
// POST request for creating a contract
router.post('/contracts', contract_service.create_contract);
//--------------------------------------------------------
// GET request for list of rates 
router.get('/rates', (req, res) => {
    rate_service.rates_list(res);
});
//GET request for a rate
router.get('/rate/:id', (req, res) => {
    rate_service.get_rate(req,res);
});
// POST request for creating a rate
router.post('/rates', rate_service.create_rate);
//--------------------------------------------------------
// GET request for list of appliances 
router.get('/appliances', (req, res) => {
    appliance_service.appliances_list(res);
});
//GET request for a appliance
router.get('/appliance/:id', (req, res) => {
    appliance_service.get_appliance(req,res);
});
// POST request for creating a appliance
router.post('/appliances', appliance_service.create_appliance);
//--------------------------------------------------------
// GET request for list of appliance_consumptions 
router.get('/consumptions', (req, res) => {
    appliance_consumption_service.consumptions_list(res);
});
//GET request for a appliance_consumption
router.get('/consumption/:id', (req, res) => {
    appliance_consumption_service.get_consumption(req, res);
});
// POST request for creating a appliance_consumption
router.post('/consumptions', appliance_consumption_service.create_consumption);
//--------------------------------------------------------
// GET request for list of roles 
router.get('/roles', (req, res) => {
    role_service.roles_list(res);
});
//GET request for a role
router.get('/role/:id', (req, res) => {
    role_service.get_role(req, res);
});
// POST request for creating a role
router.post('/roles', role_service.create_role);
//--------------------------------------------------------

// POST request for creating a client
router.post('/signup', (req, res) => {
    signup_service.signup_client(req, res);
});

module.exports = router;