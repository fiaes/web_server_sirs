var crypto = require('crypto');
var fs = require('fs');
const { query } = require('express');
const connection = require('./db');
const { addListener } = require('process');
const { monitorEventLoopDelay } = require('perf_hooks');
const { type } = require('os');

const public_key = fs.readFileSync('./serverkeys/public.key');
const private_key = fs.readFileSync('./serverkeys/server.key');
const client_public_key = fs.readFileSync('./serverkeys/clientpublic.key');

let alice;// = crypto.createDiffieHellman(2048);
let secret = "";

async function start_diffie_hellman(req, res) {
    console.log("\n\nSTART_DIFFIE_HELLMAN:\n");
    //Diffie-Hellman Instaciation 
    alice = crypto.createDiffieHellman(1024);
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
    //TODO: retirar alice things there is no need
    const alicePrime = crypto.privateDecrypt(private_key, Buffer.from(request.encrypted_alicePrime));
    const aliceGenerator = crypto.privateDecrypt(private_key, Buffer.from(request.encrypted_aliceGenerator));
    const alicekey = crypto.privateDecrypt(private_key, Buffer.from(request.encrypted_aliceKey));
    const bobKey = crypto.privateDecrypt(private_key, Buffer.from(request.encrypted_bobKey));

    console.log("Values recieved (Decrypted):");
    console.log("\t AlicePrime: " + alicePrime.toString('hex'));
    console.log("\t AliceGenerator: " + aliceGenerator.toString('hex'));
    console.log("\t AliceKey: " + alicekey.toString('hex'));
    console.log("\t BobKey: " + bobKey.toString('hex'));

    secret = alice.computeSecret(bobKey);
    

    //Insert || Update the secret with the local storage hash
    const select_keysession = "SELECT keysession FROM Keysession_table WHERE Keysession_table.rnd_hash LIKE '"+ rnd_hash +"';";
    connection.query(select_keysession, async function(err, result, fields) {
        if (err) throw err;

        //TODO: Cypher session key with Server KEK

        if(result.length == 0){
            
            const insert_keysession = "INSERT INTO Keysession_table (keysession, rnd_hash, ts) VALUES ('"+ secret.toString('hex') +"', '"+ rnd_hash +"', now())";
            connection.query(insert_keysession, function(err, result, fields) {
                if (err) throw err;
                console.log("Row Inserted.");
            });
        }else{
            const update_keysession = "UPDATE Keysession_table SET Keysession_table.keysession = '"+ secret.toString('hex') +"' WHERE Keysession_table.rnd_hash LIKE '"+ rnd_hash +"';"
            connection.query(update_keysession, function(err, result, fields) {
                if (err) throw err;
                console.log("Row Updated.");
            });
        }
    });

    const selectClientID = "SELECT clientID FROM Session_table WHERE rnd_hash LIKE '"+ rnd_hash +"';";
    connection.query(selectClientID, function(err, result, fields) {
        if (err) throw err;

        if(result.length == 0){
            console.log("No clientID found.");

        }else{
            const clientID = result[0].clientID;

            const selectClientInformation = "SELECT morada, nif, iban, email, telefone  FROM Client WHERE id = "+ clientID +";";
            connection.query(selectClientInformation, async function(err, result, fields) {

                if (err) throw err;

                let morada = "";
                let nif = "";
                let iban = "";
                let email = "";
                let telefone = "";

                console.log(result[0])

                if(result[0].morada !== null){
                    morada = await decypher_data(result[0].morada, 'hex', 'utf-8', private_key)
                    if (morada.length > 0)
                        morada = hide_data(morada, 5);
                    morada = await cypher_data(morada, 'utf-8', 'hex', secret)
                    
                }
        
                if(result[0].nif !== null){
                    nif = await decypher_data(result[0].nif, 'hex', 'utf-8', private_key)
                    if (nif.length > 0)
                        nif = hide_data(nif, 5);
                    nif = await cypher_data(nif, 'utf-8', 'hex', secret)
                }
                

                if(result[0].iban !== null){
                    iban = await decypher_data(result[0].iban, 'hex', 'utf-8', private_key)
                    if (iban.length > 0)
                        iban = hide_data(iban, 5);
                    iban = await cypher_data(iban, 'utf-8', 'hex', secret)
                }
                
                
                if(result[0].email !== null){
                    email = await decypher_data(result[0].email, 'hex', 'utf-8', private_key)
                    if (email.length > 0)
                        email = hide_data(email, 5);
                    email = await cypher_data(email, 'utf-8', 'hex', secret)
                }
                

                if(result[0].telefone != null){
                    telefone = await decypher_data(result[0].telefone, 'hex', 'utf-8', private_key)
                    if (telefone.length > 0)
                        telefone = hide_data(telefone, 5);
                    telefone = await cypher_data(telefone, 'utf-8', 'hex', secret)

                }
                console.log(JSON.stringify({morada: morada, nif: nif, iban: iban, email: email, telefone: telefone}))

                res.send(JSON.stringify({morada: morada, nif: nif, iban: iban, email: email, telefone: telefone}));
                
            });
        }
    });

    // const information = await get_client_information(rnd_hash);
    // console.log("Information:")
    // console.log(information)    
}

async function decypher_data(encrypted_data, inputEncoding, outputEncoding, secret_passed){
    const decipher = crypto.createDecipher("aes-256-cbc", secret_passed);
    let decrypted = decipher.update(encrypted_data, inputEncoding, outputEncoding);
    decrypted += decipher.final(outputEncoding);
    return decrypted;
}

async function cypher_data(data, inputEncoding, outputEncoding, secret_passed){
    const algorithm = 'aes-256-cbc';
    const cipher  = crypto.createCipher(algorithm, secret_passed);
    let encrypted = cipher.update(data, inputEncoding, outputEncoding);
    encrypted += cipher.final(outputEncoding);
    return encrypted;
}

async function save_client_information(req, res) {
    const request = await req.body;
    const rnd_hash = request.token;

    const selectClientID = "SELECT clientID FROM Session_table WHERE rnd_hash LIKE '"+ rnd_hash +"';";
    connection.query(selectClientID, async function(err, result, fields) {
        if (err) throw err;
        console.log("rnd_hash")
        console.log(rnd_hash)

        //TODO: Testar a timestamp da session key

        if(result.length == 0){
            console.log("No clientID found, in save_client_information.");

        }else{

            //Decypher with the session key
            const decrypted_morada = await decypher_data(request.morada, 'hex', 'utf-8', secret.toString('hex'));
            const decrypted_nif = await decypher_data(request.nif, 'hex', 'utf-8', secret.toString('hex'));
            const decrypted_iban = await decypher_data(request.iban, 'hex', 'utf-8', secret.toString('hex'));
            const decrypted_email = await decypher_data(request.email, 'hex', 'utf-8', secret.toString('hex'));
            const decrypted_telefone =  await decypher_data(request.telefone, 'hex', 'utf-8', secret.toString('hex'));


            //Cypher with the private key
            const encrypted_morada = await cypher_data(decrypted_morada, 'utf-8', 'hex', private_key);
            const encrypted_nif = await cypher_data(decrypted_nif, 'utf-8', 'hex', private_key);
            const encrypted_iban = await cypher_data(decrypted_iban, 'utf-8', 'hex', private_key);
            const encrypted_email = await cypher_data(decrypted_email, 'utf-8', 'hex', private_key);
            const encrypted_telefone = await cypher_data(decrypted_telefone, 'utf-8', 'hex', private_key);

            const clientID = result[0].clientID;

            const update_Client = "UPDATE Client SET Client.morada = '" + encrypted_morada + "', Client.nif = '"+ encrypted_nif +"', Client.iban = '"+ encrypted_iban +"', Client.email = '"+ encrypted_email +"', Client.telefone = '"+ encrypted_telefone +"' WHERE Client.id = "+ clientID +";";
            connection.query(update_Client, function(err, result, fields) {
                if (err) throw err;
                console.log("Client Updated.");
            });

            res.send(JSON.stringify({success: "Critical data Updated."}));
        }
    });
}

function hide_data(value, nrVisibleChars) {
    const first_part = value.substring(0, nrVisibleChars - 1);
    const hidden = '*'.repeat(value.length - (nrVisibleChars - 1));
    return first_part + hidden;
}

module.exports = {
    start_diffie_hellman,
    end_diffie_hellman,
    save_client_information
}