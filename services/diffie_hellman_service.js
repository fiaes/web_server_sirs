const { query } = require('express');
const connection = require('./db');
var crypto = require('crypto');


var fs = require('fs');

const public_key = fs.readFileSync('./serverkeys/public.key');
const private_key = fs.readFileSync('./serverkeys/server.key');
const client_public_key = fs.readFileSync('./serverkeys/clientpublic.key');


async function get_user_information(req, res) {
    
    const request = req.body

    //Sanitizar os valores
    const session = request.token;
    const encrypted_payload = Buffer.from(request.payload);
    const client_signature = Buffer.from(request.signature.data);
    console.log(client_signature)

    
    const selectSession = "SELECT clientID FROM Session_table WHERE rnd_hash LIKE '" + session + "';";
    connection.query(selectSession, function(err, result, fields) {
        if (err) throw err;
        
        if(result.length != 0){
            
            const clientID = result[0].clientID;

            console.log("clientID: " + clientID);

            const selectClient = "SELECT publickey FROM Client WHERE Client.id = "+ clientID;
            
            // connection.query(selectClient, function(err, result, fields) {
            //     if(result.length != 0){

            //         const client_public_key = result[0].publickey;
            //         console.log(typeof(client_public_key))

                    // TEST À ASSINATURA:
                    const verify = crypto.createVerify('RSA-SHA256');
                    verify.write(encrypted_payload.toString('utf-8'));
                    verify.end();
                    console.log(verify.verify(client_public_key  , client_signature));
                    
    //                 const verify = crypto.createVerify('SHA256');
    //                 verify.write(encrypted_payload);
    //                 verify.end();

    //                 //Authenticity
    //                 if(verify.verify(client_public_key, client_signature, 'hex')){
    //                     //Confidentiality
    //                     const payload = crypto.privateDecrypt(private_key, encrypted_payload).toString('utf-8');

    //                     const user_prime = payload.prime;
    //                     const user_generator = payload.generator;
    //                     const alicekey = payload.key;

    //                     //TODO: Perfect Forward Secrecy ver a função
    //                     const server_diffie_hellman = crypto.createDiffieHellman(user_prime, user_generator);
    //                     const serverkey = server_diffie_hellman.generateKeys();
                        
    //                     //TODO: GUARDAR SESSÃO COM SESSIONKEY
    //                     const sessionkey = bob.computeSecret(aliceKey);
                        
    //                     //Cypher com a public key do cliente para só ele poder dar decrypt
    //                     const encrypted_response = crypto.publicEncrypt(client_public_key, serverkey);
                        
    //                     //É assinado o yb para enviar para Alice com a private key do bob para gerar authenticação
    //                     const sign = crypto.createSign('SHA256');
    //                     sign.write(encrypted_response.toString('utf-8'));
    //                     sign.end();
    //                     const signature = sign.sign(private_key, 'hex');

    //                     res.send({
    //                         serverkey: encrypted_response,
    //                         signature: signature
    //                     });
                        
    //                     /*
    //                     const payload_to_send = JSON.stringify({email: "fra*********@gmail.com", telefone: "910******"}); //Load from DB

    //                     const algorithm = 'aes-192-cbc';

    //                     crypto.randomFill(new Uint8Array(16), (err, iv) => {
    //                         if (err) throw err;
                        
    //                         const cipher = createCipheriv(algorithm, sessionkey, iv);
                        
    //                         const encrypted_payload_to_send = cipher.update(payload_to_send, 'utf8', 'hex');
    //                         encrypted_payload_to_send += cipher.final('hex');

    //                         //TODO: VER O TAMANHO DA KEY
    //                         const hmac = createHmac('sha256', 'a secret');
    //                         hmac.update(payload_to_send);
    //                         const hmac_hash = hmac.digest('hex');
                            
    //                         //TODO: Adicionar Timestamp à Session Key
    //                         const data = {
    //                             payload : payload_to_send,
    //                             hmac_hash: hmac_hash
    //                         }

    //                     });
    //                     */

    //                 }else{
    //                     console.log("Assinatura da Alice não verificada!")
    //                 }
            //     }else{
            //         console.log("client public key not found.")
            //     }
            // });
            

        }else{
            console.log("No session found")
        }

    });


}

module.exports = {
    get_user_information
}