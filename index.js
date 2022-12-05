const express = require('express')
const app = express()

const mysql = require('mysql2');
const connection = mysql.createConnection({
  host:"192.168.0.100",
  user:"nodejs",
  password:"password",
  database:"test",
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Server!');
});


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
