var crypto = require('crypto');
var fs = require('fs');
const { query } = require('express');
const connection = require('./db');
const { addListener } = require('process');
const { monitorEventLoopDelay } = require('perf_hooks');
const { type } = require('os');


const private_key = fs.readFileSync('./serverkeys/server.key');
//const client_public_key = fs.readFileSync('./serverkeys/clientpublic.key');
const certificate = fs.readFileSync('./serverkeys/server.crt')

let alice;// = crypto.createDiffieHellman(2048);
let secret = "";

async function start_diffie_hellman(req, res) {

    //Verification of the Certificate:
    const request = await req.body;
    const client_x509 = new crypto.X509Certificate(request.certificate);

    // Verification of: 
    // the subject CN=Frontend\n; 
    // the issuer CN=backend server\n; 
    // and if the time frame is valid.
    console.log("Certificate:")
    console.log(client_x509)
    const validFrom = new Date(client_x509.validFrom)
    const validTo = new Date(client_x509.validTo)
    const validNow = new Date()

    if (client_x509.subject.split("\n")[5].split("=")[1] != "Frontend"){
        console.log("The Subject is not the Frontend.")
        return
    }
    if (client_x509.issuer.split("\n")[5].split("=")[1] != "backend server"){
        console.log("The issuer of the certificate is not the Backend.")
        return
    }
    if (!(validNow >= validFrom && validNow <= validTo)){
        console.log("The certificate is not valid.")
        return
    }

    client_public_key = client_x509.publicKey
        

    console.log("\n\nSTART_DIFFIE_HELLMAN:\n");
    //Diffie-Hellman Instaciation 
    alice = crypto.createDiffieHellman(1024);
    const aliceKey = alice.generateKeys();
    const alicePrime = alice.getPrime();
    const aliceGenerator = alice.getGenerator();

    console.log("Values Created in Diffie-Hellman:");
    console.log("\t Alicekey: " + aliceKey.toString('hex'));
    console.log("\t AlicePrime: " + alicePrime.toString('hex'));
    console.log("\t AliceGenerator: " + aliceGenerator.toString('hex'));

    const now = new Date().getTime().toString();
    console.log("\t TimeStamp: " + now);

    //Preparing values to be sent signed by client's public key
    const encrypted_aliceKey = crypto.publicEncrypt(client_public_key, aliceKey);
    const encrypted_alicePrime = crypto.publicEncrypt(client_public_key, alicePrime);
    const encrypted_aliceGenerator = crypto.publicEncrypt(client_public_key, aliceGenerator);
    const encrypted_timestamp = crypto.publicEncrypt(client_public_key, Buffer.from(now));

    console.log("Values Created in Diffie-Hellman encrypted with the client's public key:");
    console.log("\t Encrypted Alicekey: " + encrypted_aliceKey.toString('hex'));
    console.log("\t Encrypted AlicePrime: " + encrypted_alicePrime.toString('hex'));
    console.log("\t Encrypted AliceGenerator: " + encrypted_aliceGenerator.toString('hex'));
    console.log("\t Encrypted TimeStamp: " + encrypted_timestamp.toString('hex'));

    //Signing values to be sent
    const sign = crypto.createSign('RSA-SHA256');
    sign.write(encrypted_aliceKey);
    sign.write(encrypted_alicePrime);
    sign.write(encrypted_aliceGenerator);
    sign.write(encrypted_timestamp)
    sign.end();
    const signature = await sign.sign(private_key);

    res.send(JSON.stringify({
        encrypted_aliceKey: encrypted_aliceKey,
        encrypted_alicePrime: encrypted_alicePrime,
        encrypted_aliceGenerator: encrypted_aliceGenerator,
        encrypted_timestamp: encrypted_timestamp,
        certificate: certificate,
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
    verify.write(Buffer.from(request.encrypted_bobKey));
    verify.end();

    if(!verify.verify(client_public_key, signature)){
        console.log("Signature is not verified.")
        return;
    }

    console.log("The signature was verified.")

    //Values to createDiffieHellman
    const bobKey = crypto.privateDecrypt(private_key, Buffer.from(request.encrypted_bobKey));
    console.log("\t BobKey: " + bobKey.toString('hex'));

    secret = alice.computeSecret(bobKey);
    
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

                console.log("The critical data present in Database:")
                if(result[0].morada !== null){
                    
                    morada = await decypher_data(result[0].morada, 'hex', 'utf-8', private_key)
                    console.log("\t Morada:")
                    console.log("\t\t Database (Encrypted with key): " + result[0].morada)
                    console.log("\t\t Database (Decrypted with key): " + morada)
                    if (morada.length > 0){
                        morada = hide_data(morada, 5);
                        console.log("\t\t Hide the data: " + morada)
                    }
                    morada = await cypher_data(morada, 'utf-8', 'hex', secret)
                    console.log("\t\t Data encrypted with the shared key: " + morada)
                }
        
                if(result[0].nif !== null){
                    nif = await decypher_data(result[0].nif, 'hex', 'utf-8', private_key)
                    console.log("\t NIF:")
                    console.log("\t\t Database (Encrypted with key): " + result[0].nif)
                    console.log("\t\t Database (Decrypted with key): " + nif)
                    if (nif.length > 0){
                        nif = hide_data(nif, 5);
                        console.log("\t\t Hide the data: " + nif)
                    }
                        
                    nif = await cypher_data(nif, 'utf-8', 'hex', secret)
                    console.log("\t\t Data encrypted with the shared key: " + nif)
                }
                

                if(result[0].iban !== null){
                    iban = await decypher_data(result[0].iban, 'hex', 'utf-8', private_key);
                    console.log("\t IBAN:")
                    console.log("\t\t Database (Encrypted with key): " + result[0].iban)
                    console.log("\t\t Database (Decrypted with key): " + iban)
                    if (iban.length > 0){
                        iban = hide_data(iban, 5);
                        console.log("\t\t Hide the data: " + iban)
                    }
                        
                    iban = await cypher_data(iban, 'utf-8', 'hex', secret)
                    console.log("\t\t Data encrypted with the shared key: " + iban)
                }
                
                
                if(result[0].email !== null){
                    email = await decypher_data(result[0].email, 'hex', 'utf-8', private_key);
                    console.log("\t Email:");
                    console.log("\t\t Database (Encrypted with key): " + result[0].email);
                    console.log("\t\t Database (Decrypted with key): " + email);
                    if (email.length > 0){
                        email = hide_data(email, 5);
                        console.log("\t\t Hide the data: " + email);
                    }
                        
                    email = await cypher_data(email, 'utf-8', 'hex', secret)
                    console.log("\t\t Data encrypted with the shared key: " + email)
                }
                

                if(result[0].telefone != null){
                    telefone = await decypher_data(result[0].telefone, 'hex', 'utf-8', private_key);
                    console.log("\t Telefone:");
                    console.log("\t\t Database (Encrypted with key): " + result[0].telefone);
                    console.log("\t\t Database (Decrypted with key): " + telefone);
                    if (telefone.length > 0){
                        telefone = hide_data(telefone, 5);
                        console.log("\t\t Hide the data: " + telefone);
                    }
                        
                    telefone = await cypher_data(telefone, 'utf-8', 'hex', secret)
                    console.log("\t\t Data encrypted with the shared key: " + telefone)
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

function addHours(date, hours) {
    date.setHours(date.getHours() + hours);
    return date;
}

async function save_client_information(req, res) {
    const request = await req.body;
    const rnd_hash = request.token;

    const selectClientID = "SELECT clientID FROM Session_table WHERE rnd_hash LIKE '"+ rnd_hash +"';";
    connection.query(selectClientID, async function(err, result, fields) {
        if (err) throw err;

        if(result.length == 0){
            console.log("No clientID found, in save_client_information.");

        }else{
            console.log("Saving Critial Data:")
            console.log("\t Encrypted Data with the Shared Key:")
            console.log("\t\t" + request.morada)
            console.log("\t\t" + request.nif)
            console.log("\t\t" + request.iban)
            console.log("\t\t" + request.email)
            console.log("\t\t" + request.telefone)

            //Decypher with the session key
            const decrypted_morada = await decypher_data(request.morada, 'hex', 'utf-8', secret.toString('hex'));
            const decrypted_nif = await decypher_data(request.nif, 'hex', 'utf-8', secret.toString('hex'));
            const decrypted_iban = await decypher_data(request.iban, 'hex', 'utf-8', secret.toString('hex'));
            const decrypted_email = await decypher_data(request.email, 'hex', 'utf-8', secret.toString('hex'));
            const decrypted_telefone =  await decypher_data(request.telefone, 'hex', 'utf-8', secret.toString('hex'));

            console.log("\t Decrypted Data with the Shared Key:")
            console.log("\t\t" + decrypted_morada)
            console.log("\t\t" + decrypted_nif)
            console.log("\t\t" + decrypted_iban)
            console.log("\t\t" + decrypted_email)
            console.log("\t\t" + decrypted_telefone)


            //Cypher with the private key
            const encrypted_morada = await cypher_data(decrypted_morada, 'utf-8', 'hex', private_key);
            const encrypted_nif = await cypher_data(decrypted_nif, 'utf-8', 'hex', private_key);
            const encrypted_iban = await cypher_data(decrypted_iban, 'utf-8', 'hex', private_key);
            const encrypted_email = await cypher_data(decrypted_email, 'utf-8', 'hex', private_key);
            const encrypted_telefone = await cypher_data(decrypted_telefone, 'utf-8', 'hex', private_key);

            console.log("\t Encrypted Data to be sent to the Database:")
            console.log("\t\t" + encrypted_morada)
            console.log("\t\t" + encrypted_nif)
            console.log("\t\t" + encrypted_iban)
            console.log("\t\t" + encrypted_email)
            console.log("\t\t" + encrypted_telefone)

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