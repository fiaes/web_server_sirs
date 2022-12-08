const express = require('express')
const app = express()
const fs = require('fs');
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host:"192.168.0.100",
  user:"nodejs",
  password:"password",
  database:"remotedb",
  ssl: {
    ca: fs.readFileSync(__dirname + '/certs/ca.pem'),
    key: fs.readFileSync(__dirname + '/certs/client-key.pem'),
    cert: fs.readFileSync(__dirname + '/certs/client-cert.pem')
  }
});


connection.connect();
connection.query('SELECT * FROM Client', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results);
});

connection.end();
// connection.connect((err) => {
//   if (err) throw err;
//   console.log('Connected to MySQL Server!');
// });


//const port = 3000
//const valuesRouter = require('./routes/values')

/*app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get('/', (req, res) => {
  res.json({message: "ok"})
})

app.use("/values", valuesRouter);
/* Error handler middleware 
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
  return;
});


app.listen(port, () => {
  console.log('Example app listening on port ${port}')
})
*/
