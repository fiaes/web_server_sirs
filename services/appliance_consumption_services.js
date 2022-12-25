const { query } = require('express');
const connection = require('./db');
const utils = require('./utils');

//Get all appliance_consumptions
async function consumptions_list(res) {
    let selectQuery = 'SELECT * FROM Appliance_consumption';
    connection.query(selectQuery, function(err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    });
}

// Get a single appliance_consumption
async function get_consumption(req, res) {
    if(isNaN(Number([req.params.id]))) {
        return res.status(400).json({ err: "Numbers only, please!"})
    }
    let selectQuery = 'SELECT * FROM Appliance_consumption WHERE id = ?';
    connection.query(selectQuery, [req.params.id], function(err, result, fields) {
        if (err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    });
}

async function calculate_invoices(req, res) {
    // Initialize invoices variable
    let invoices = 0;
    // Get clientID from the Session_table
    var params = [req.params.rnd_hash];
    const selectSession = "SELECT clientID FROM Session_table WHERE rnd_hash LIKE ?;";
    const result_client = await new Promise((resolve, reject) => {
        connection.query(selectSession, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
    if(result_client.length != 0){
        const clientID = result_client[0].clientID;
        // Get appliances for the client
        let selectQuery = 'SELECT * FROM Appliance WHERE clientID = ?';
        const result_appliances = await new Promise((resolve, reject) => {
            connection.query(selectQuery, clientID, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        if(result_appliances.length != 0){
            // Iterate over the appliances and calculate the invoices
            for(const appliance of result_appliances) {
                const applianceID = appliance.id;
                const contractID = appliance.contractID;
                let sumConsumptions = 0;
                // Get consumptions for the appliance
                let select_consumptions = 'SELECT * FROM Appliance_consumption WHERE applianceID = ?;';
                const result_consumptions = await new Promise((resolve, reject) => {
                    connection.query(select_consumptions, applianceID, (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
                if(result_consumptions.length!=0){
                    result_consumptions.forEach(consumption => {
                        sumConsumptions += consumption.consumption;
                    });
                }
                invoices += sumConsumptions * 5;
                /* // Get contract for the appliance
                let select_contract = 'SELECT * FROM Contract WHERE id = ?;';
                const result_contract = await new Promise((resolve, reject) => {
                    connection.query(select_contract, contractID, (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
                if(result_contract.length != 0){
                    const contract_type = result_contract[0].tipo;

                    // Calculate the invoices for the appliance
                    if(contract_type == "Bi-Hour Rate"){
                        invoices += sumConsumptions * contract_type;
                    } else {
                        invoices += sumConsumptions * 5;
                    }
                } */
            }

            // Send the invoices back to the client
            console.log("Invoices: " + invoices);
            res.send(JSON.stringify(invoices));
        }
    }
}



// Create a appliance_consumption.
async function create_consumption(req, res, next) {
    var params = [req.body.applianceID, req.body.ts, req.body.consumption];
    if(!utils.validate_input(params))
        return res.status(400).json({ err: "Invalid input! (Only numbers, letters and space)"});
    var selectQuery = "INSERT INTO Appliance_consumption (applianceID,ts,consumption) VALUES (?,?,?)";
    connection.query(selectQuery, params, function(err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
};

module.exports = {
    consumptions_list,
    get_consumption,
    calculate_invoices,
    create_consumption
}