const fs = require('fs');
const config = {
    db: {
        host: "192.168.0.100",
        user: "nodejs",
        password: "password",
        database: "remotedb",
        ssl: {
            ca: fs.readFileSync(__dirname + '/certs/ca.pem'),
            key: fs.readFileSync(__dirname + '/certs/client-key.pem'),
            cert: fs.readFileSync(__dirname + '/certs/client-cert.pem')
        }
    },
    listPerPage: 10,
};
module.exports = config;