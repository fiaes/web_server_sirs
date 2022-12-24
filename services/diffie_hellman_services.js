var crypto = require('crypto');
var fs = require('fs');
const { query } = require('express');
const connection = require('./db');
const { addListener } = require('process');

const public_key = fs.readFileSync('./serverkeys/public.key');
const private_key = fs.readFileSync('./serverkeys/server.key');
const client_public_key = fs.readFileSync('./serverkeys/clientpublic.key');

const alice = crypto.createDiffieHellman(1024);

async function start_diffie_hellman(req, res) {
    console.log("\n\nSTART_DIFFIE_HELLMAN:\n");
    //Diffie-Hellman Instaciation
    //const alice = crypto.createDiffieHellman(1024);
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

    //Insert the secrete with the local storage hash
    const insert_keysession = "INSERT INTO Keysession_table (keysession, rnd_hash, ts) VALUES ('"+ secret.toString('hex') +"', '"+ rnd_hash +"', now())";
    connection.query(insert_keysession, function(err, result, fields) {
        if (err) throw err;
        console.log("Row Inserted.");
    });

    console.log("\t\t Secret")
    console.log(secret.toString("hex"))
}

module.exports = {
    start_diffie_hellman,
    end_diffie_hellman
}
