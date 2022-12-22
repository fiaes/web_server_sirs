const { query } = require('express');
const connection = require('./db');
var crypto = require('crypto');


var fs = require('fs');

const public_key = fs.readFileSync('./serverkeys/public.key');
const private_key = fs.readFileSync('./serverkeys/server.key');
const client_public_key = fs.readFileSync('./serverkeys/clientpublic.key');


async function get_user_information(req, res) {
    console.log("Begin Request")
    
    const request = req.body

    //Sanitizar os valores
    const session = request.token;
    const encrypted_prime = Buffer.from(request.prime, 'hex');
    const encrypted_generator = Buffer.from(request.generator, 'hex');
    const encrypted_key = Buffer.from(request.key, 'hex');
    const client_signature = Buffer.from(request.signature);

    
    // const selectSession = "SELECT clientID FROM Session_table WHERE rnd_hash LIKE '" + session + "';";
    // connection.query(selectSession, function(err, result, fields) {
    //     if (err) throw err;
        
    //     if(result.length != 0){
            
            // const clientID = result[0].clientID;

            // console.log("clientID: " + clientID);

            // const selectClient = "SELECT publickey FROM Client WHERE Client.id = "+ clientID;
            
            // connection.query(selectClient, function(err, result, fields) {
            //     if(result.length != 0){

            //         const client_public_key = result[0].publickey;
            //         console.log(typeof(client_public_key))

                    // TEST À ASSINATURA:
                    const verify = crypto.createVerify('RSA-SHA256');
                    verify.write(encrypted_prime);
                    verify.end();
                    console.log(verify.verify(client_public_key, client_signature));
                    
                    const user_prime = crypto.privateDecrypt(private_key, encrypted_prime);
                    console.log("user_prime")
                    console.log(user_prime.toString('utf-8'))
                    const user_generator = crypto.privateDecrypt(private_key, encrypted_generator);
                    console.log("user_generator")
                    console.log(user_generator.toString('utf-8'))
                    const key = crypto.privateDecrypt(private_key, encrypted_key);
                    //console.log(key.toString('utf-8'))

                    try {
                      //TODO: Perfect Forward Secrecy ver a função
                      //const server_diffie_hellman = crypto.createDiffieHellman(user_prime, user_generator);
                      const server_diffie_hellman = crypto.createDiffieHellman(user_prime, user_generator);
                      const serverkey = server_diffie_hellman.generateKeys();

                      //TODO: GUARDAR SESSÃO COM SESSIONKEY
                      const sessionkey = server_diffie_hellman.computeSecret(key);
                      console.log("sessionkey:")
                      console.log(sessionkey.toString('utf-8'))
                          
                      //Cypher com a public key do cliente para só ele poder dar decrypt
                    
                      const encrypted_response = crypto.publicEncrypt(client_public_key, serverkey);
                      //É assinado o yb para enviar para Alice com a private key do bob para gerar authenticação
                      const sign = crypto.createSign('RSA-SHA256');
                      sign.write(encrypted_response);
                      sign.end();
                      const signature = sign.sign(private_key, 'hex');

                      res.send(JSON.stringify({
                          serverkey: encrypted_response,
                          signature: signature
                      }));

                      

                    } catch (error) {
                      console.log(error)
                    }
                    
                        
                    
                    
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
            

    //     }else{
    //         console.log("No session found")
    //     }

    // });


}

module.exports = {
    get_user_information
}