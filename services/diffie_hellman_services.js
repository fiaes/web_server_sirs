var crypto = require('crypto');
var fs = require('fs');
const { query } = require('express');
const connection = require('./db');
const { addListener } = require('process');
const { monitorEventLoopDelay } = require('perf_hooks');

const public_key = fs.readFileSync('./serverkeys/public.key');
const private_key = fs.readFileSync('./serverkeys/server.key');
const client_public_key = fs.readFileSync('./serverkeys/clientpublic.key');

const alice = crypto.createDiffieHellman(1024);

async function start_diffie_hellman(req, res) {
    console.log("\n\nSTART_DIFFIE_HELLMAN:\n");
    //Diffie-Hellman Instaciation 
    const aliceKey = alice.generateKeys();
    const alicePrime = alice.getPrime();
    const aliceGenerator = alice.getGenerator();

    console.log("Values sent:");
    console.log("\t Alicekey: " + aliceKey.toString('hex'));
    console.log("\t AlicePrime: " + alicePrime.toString('hex'));
    console.log("\t AliceGenerator: " + aliceGenerator.toString('hex'));

    //Preparing values to be sent signed by client's public key
    const encrypted_aliceKey = crypto.publicEncrypt(client_public_key, aliceKey);
    const encrypted_alicePrime = crypto.publicEncrypt(client_public_key, alicePrime);
    const encrypted_aliceGenerator = crypto.publicEncrypt(client_public_key, aliceGenerator);

    //Signing values to be sent
    const sign = crypto.createSign('RSA-SHA256');
    sign.write(encrypted_aliceKey);
    sign.write(encrypted_alicePrime);
    sign.write(encrypted_aliceGenerator);
    sign.end();
    const signature = await sign.sign(private_key);

    res.send(JSON.stringify({
        encrypted_aliceKey: encrypted_aliceKey,
        encrypted_alicePrime: encrypted_alicePrime,
        encrypted_aliceGenerator: encrypted_aliceGenerator,
        signature: signature
    }));
}


async function end_diffie_hellman(req, res) {
    console.log("\n\nEND_DIFFIE_HELLMAN:\n");

    const request = await req.body;

    //Session local storage hash
    const rnd_hash = request.token;

    //Authenticity verification
    const signature = Buffer.from(request.signature);
    
    const verify = crypto.createVerify('RSA-SHA256');
    verify.write(Buffer.from(request.encrypted_alicePrime));
    verify.write(Buffer.from(request.encrypted_aliceGenerator));
    verify.write(Buffer.from(request.encrypted_aliceKey));
    verify.write(Buffer.from(request.encrypted_bobKey));
    verify.end();

    if(!verify.verify(client_public_key, signature)){
        console.log("Signature not verified.")
        return;
    }

    //Values to createDiffieHellman
    //TODO: retirar alice shit there is no need
    const alicePrime = crypto.privateDecrypt(private_key, Buffer.from(request.encrypted_alicePrime));
    const aliceGenerator = crypto.privateDecrypt(private_key, Buffer.from(request.encrypted_aliceGenerator));
    const alicekey = crypto.privateDecrypt(private_key, Buffer.from(request.encrypted_aliceKey));
    const bobKey = crypto.privateDecrypt(private_key, Buffer.from(request.encrypted_bobKey));

    console.log("Values recieved (Decrypted):");
    console.log("\t AlicePrime: " + alicePrime.toString('hex'));
    console.log("\t AliceGenerator: " + aliceGenerator.toString('hex'));
    console.log("\t AliceKey: " + alicekey.toString('hex'));
    console.log("\t BobKey: " + bobKey.toString('hex'));

    const secret = alice.computeSecret(bobKey);
    

    //Insert the secret with the local storage hash
    const select_keysession = "SELECT keysession FROM Keysession_table WHERE Keysession_table.rnd_hash LIKE '"+ rnd_hash +"';";
    connection.query(select_keysession, function(err, result, fields) {
        if (err) throw err;

        //TODO: Cypher session key with Server KEK
        const encrypted_secret = crypto.publicEncrypt(public_key, secret.toString('hex'))

        if(result.length == 0){
            
            const insert_keysession = "INSERT INTO Keysession_table (keysession, rnd_hash, ts) VALUES ('"+ secret +"', '"+ rnd_hash +"', now())";
            connection.query(insert_keysession, function(err, result, fields) {
                if (err) throw err;
                console.log("Row Inserted.");
            });
        }else{
            const update_keysession = "UPDATE Keysession_table SET Keysession_table.keysession = '"+ secret +"' WHERE Keysession_table.rnd_hash LIKE '"+ rnd_hash +"';"
            connection.query(update_keysession, function(err, result, fields) {
                if (err) throw err;
                console.log("Row Updated.");
            });
        }
    });


    //get_client_information();

    

    console.log("\t\t Secret")
    console.log(secret.toString("hex"))
}

async function save_client_information(req, res) {
    const request = await req.body;
    const rnd_hash = request.token;

    const selectClientID = "SELECT clientID FROM Session_table WHERE rnd_hash LIKE '"+ rnd_hash +"';";
    connection.query(selectClientID, function(err, result, fields) {
        if (err) throw err;
        if(result.length == 0){
            console.log("No clientID found.");

        }else{
            const clientID = result[0].clientID;
            
            //TODO: Decypher session key with private key from server.
            const encrypted_morada =crypto.publicEncrypt(public_key, request.morada) 
            const encrypted_nif =crypto.publicEncrypt(public_key, request.nif) 
            const encrypted_iban =crypto.publicEncrypt(public_key, request.iban) 
            const encrypted_email =crypto.publicEncrypt(public_key, request.email) 
            const encrypted_telefone =crypto.publicEncrypt(public_key, request.telefone)

            const update_Client = "UPDATE Client SET Client.morada = '" + encrypted_morada + "', Client.nif = '"+ encrypted_nif +"', Client.iban = '"+ encrypted_iban +"', Client.email = '"+ encrypted_email +"', Client.telefone = '"+ encrypted_telefone +"' WHERE Client.id = "+ clientID +";";
            connection.query(update_Client, function(err, result, fields) {
                if (err) throw err;
                console.log("Client Updated.");
            });
        }
    });
}


async function get_client_information() {
    const selectClientID = "SELECT clientID FROM Session_table WHERE rnd_hash LIKE '"+ rnd_hash +"';";

    connection.query(selectClientID, function(err, result, fields) {
        if (err) throw err;

        if(result.length == 0){
            console.log("No clientID found.");

        }else{
            const clientID = result[0].clientID;

            const selectClientInformation = "SELECT morada, nif, iban, email, telefone  FROM Client WHERE id = "+ clientID +";";
            connection.query(selectClientInformation, function(err, result, fields) {
                const morada = crypto.privateDecrypt(private_key, Buffer.from(result[0].morada)).toString('utf-8');
                console.log(hide_data(morada, 5))

                const nif = crypto.privateDecrypt(private_key, Buffer.from(result[0].nif));
                console.log(hide_data(nif, 3))

                const iban = crypto.privateDecrypt(private_key, Buffer.from(result[0].iban));
                console.log(hide_data(iban, 5))
                
                const email = crypto.privateDecrypt(private_key, Buffer.from(result[0].email));
                console.log(hide_data(email, 5))

                const telefone = crypto.privateDecrypt(private_key, Buffer.from(result[0].telefone));
                console.log(hide_data(telefone, 4))

            });
        }
    });
}

function hide_data(value, nrVisibleChars) {
    const first_part = value.substring(0, nrVisibleChars - 1);
    const hidden = '*'.repeat(morada.length - (nrVisibleChars - 1));
    return first_part + hidden;
}

module.exports = {
    start_diffie_hellman,
    end_diffie_hellman,
    save_client_information
}