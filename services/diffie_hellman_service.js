const { query } = require('express');
const connection = require('./db');
var crypto = require('crypto');


var fs = require('fs');

const public_key = fs.readFileSync('./serverkeys/public.key');
const private_key = fs.readFileSync('./serverkeys/server.key');


async function get_user_information(req, res) {
    //Sanitizar os valores
    const session = req.body.token;
    const encrypted_payload = req.body.payload;
    const client_signature = req.body.signature;
    
    const selectSession = "SELECT clientID FROM Session_table WHERE rnd_hash = " + session + ";";
    connection.query(selectSession, function(err, result, fields) {
        if (err) throw err;
        
        if(result.length != 0){
            
            const clientID = result[0].clientID;
            const selectClient = "SELECT publickey FROM Client WHERE Client.id = "+ clientID;
            
            connection.query(selectClient, function(err, result, fields) {
                if(result.length != 0){
                    const client_public_key = result[0].publickey;
                    const verify = crypto.createVerify('SHA256');
                    verify.write(encrypted_payload);
                    verify.end();

                    //Authenticity
                    if(verify.verify(client_public_key, client_signature, 'hex')){
                        //Confidentiality
                        const payload = crypto.privateDecrypt(private_key, encrypted_payload).toString('utf-8');

                        const user_prime = payload.prime;
                        const user_generator = payload.generator;

                        //TODO: Perfect Forward Secrecy ver a função
                        const server_diffie_hellman = crypto.createDiffieHellman(user_prime, user_generator);
                        const sessionkey = server_diffie_hellman.generateKeys();


                        const payload_to_send = JSON.stringify({email: "fra*********@gmail.com", telefone: "910******"}); //Load from DB

                        const algorithm = 'aes-192-cbc';

                        crypto.randomFill(new Uint8Array(16), (err, iv) => {
                            if (err) throw err;
                        
                            const cipher = createCipheriv(algorithm, sessionkey, iv);
                        
                            const encrypted_payload_to_send = cipher.update(payload_to_send, 'utf8', 'hex');
                            encrypted_payload_to_send += cipher.final('hex');

                            //TODO: VER O TAMANHO DA KEY
                            const hmac = createHmac('sha256', 'a secret');
                            hmac.update(payload_to_send);
                            const hmac_hash = hmac.digest('hex');
                            
                            //TODO: Adicionar Timestamp à Session Key
                            const data = {
                                payload : payload_to_send,
                                hmac_hash: hmac_hash
                            }

                        });

                    }else{

                    }
                }else{
                    
                }
            });
            

        }else{

        }

    });


}

module.exports = {
    signup_client
}