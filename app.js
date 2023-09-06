const express = require('express');
const bodyParser = require('body-parser');
app.use(bodyParser.json());


const mysql = require('mysql2');

const app = express();
const port = 3333;



const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'gamedb'
  });

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database: ', err);
      return;
    }
    console.log('Connected to the database!');
  });
  
  connection.query('INSERT INTO score_table SET ?', insertData, (err, result) => {
    if (err) {
      console.error('Error inserting data: ', err);
      return;
    }
    console.log('Data inserted successfully!');
  });

  connection.query('SELECT * FROM score_table', (err, rows) => {
    if (err) {
      console.error('Error retrieving data: ', err);
      return;
    }
    console.log('Retrieved data: ', rows);
  });

  connection.end((err) => {
    if (err) {
      console.error('Error closing the database connection: ', err);
      return;
    }
    console.log('Disconnected from the database!');
  });

  // Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
  