const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
//const port = 3306;
const port = 3333;

app.use(bodyParser.json());
app.use(cors());

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'password',
  database: 'gamedb',
});

/* 
the session of change to AWS server in the files
home.page.ts
game.page.ts
top-ten.page.ts
and of course server.js (this file)
also, need to change the port (in this file on top) to port 3306 (default of mysql)
the second query in the link below:
https://chat.openai.com/share/c2b96df8-09bd-4025-b731-f42667556f6d
*/


// const connection = mysql.createConnection({
//   host: 'gamedb.cbgja1mg2wpp.us-east-1.rds.amazonaws.com',
//   user: 'mixitAdmin',
//   password: 'mixitPassword',
//   database: 'gamedb',
// });

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.get('/', (req, res) => {
  connection.query('SELECT * FROM score_table', (error, results, fields) => {
    if (error) {
      console.error('Error executing MySQL query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.send(results);
  });
});

app.post('/score_table', (req, res) => {
    const { name, score } = req.body;
  
    connection.query(
      'INSERT INTO score_table (name, score) VALUES (?, ?)',
      [name, score],
      (error, results, fields) => {
        if (error) {
          console.error('Error executing MySQL query:', error);
          res.status(500).json({ message: 'Failed to save score. Please try again.' });
          return;
        }
        res.json({ message: 'Score saved successfully' });
      }
    );
  });
  
  
  
//   // Define an API endpoint to fetch the image URLs from the mixedAnimal table
//   app.get('/mixedAnimal', (req, res) => {
//   console.log('Received request for mixed animals'); // Add this line for debugging
//   const sqlQuery = 'SELECT FirstAnimal, SecondAnimal, ImageURL FROM mixedAnimal ORDER BY RAND() LIMIT 10';
//   connection.query(sqlQuery, (err, results) => {
//     if (err) {
//       console.error('Error executing SQL query:', err);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       res.json(results);
//     }
//   });
// });

  // Define an API endpoint to fetch the image URLs from the mixedAnimal table
app.get('/mixedAnimal', (req, res) => {
  const category = req.query.category; // Get the 'category' query parameter
  console.log('Received request for mixed animals'); // Add this line for debugging
  
  // Construct the SQL query based on the category
  let sqlQuery = '';
  if (category === 'Animals') {
    sqlQuery = 'SELECT FirstAnimal, SecondAnimal, ImageURL FROM mixedAnimal ORDER BY RAND() LIMIT 10';
  } else if (category === 'Food') {
    // Construct the query for the 'Food' category
    // Modify this query based on your table structure for the 'Food' category
    sqlQuery = 'SELECT FirstFood, SecondFood, ImageURL FROM mixedFood ORDER BY RAND() LIMIT 10';
  } else {
    // Handle other categories or return an error if needed
    res.status(400).json({ error: 'Invalid category' });
    return;
  }
  
  // Execute the constructed SQL query
  connection.query(sqlQuery, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});



  
  // app.get('/specificAnimals', (req, res) => {
  //   const { firstAnimal, secondAnimal } = req.query;
  //   console.log('Received request for specific animals:', firstAnimal, secondAnimal); // Add this line for debugging
  
  //   // Query to fetch 2 specific ImageURLs from the animals table with matching AnimalName
  //   const sqlQuery = `SELECT ImageURL FROM animals WHERE AnimalName IN (?, ?)`;
  //   const values = [firstAnimal, secondAnimal];
  
  //   connection.query(sqlQuery, values, (err, results) => {
  //     if (err) {
  //       console.error('Error executing SQL query:', err);
  //       res.status(500).json({ error: 'Internal Server Error' });
  //     } else {
  //       const imageUrlsArray = results.map((row) => row.ImageURL);
  //       res.json(imageUrlsArray);
  //     }
  //   });
  // });

  app.get('/specificAnimals', (req, res) => {
    const { firstAnimal, secondAnimal, category } = req.query;
    console.log('Received request for specific animals:', firstAnimal, secondAnimal, category);
  
    // Construct the SQL query based on the category
    let sqlQuery = '';
    let tableName = '';
  
    if (category === 'Animals') {
      sqlQuery = `SELECT ImageURL FROM animals WHERE AnimalName IN (?, ?)`;
      tableName = 'animals';
    } else if (category === 'Plants') {
      // Construct the query for the 'Food' category
      // Modify this query and tableName based on your table structure for the 'Food' category
      sqlQuery = `SELECT ImageURL FROM food WHERE FoodName IN (?, ?)`;
      tableName = 'food';
    } else {
      // Handle other categories or return an error if needed
      res.status(400).json({ error: 'Invalid category' });
      return;
    }
  
    const values = [firstAnimal, secondAnimal];
  
    connection.query(sqlQuery, values, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        const imageUrlsArray = results.map((row) => row.ImageURL);
        res.json(imageUrlsArray);
      }
    });
  });
  
  
//   app.get('/randomAnimals', (req, res) => {
//   const { excludeAnimals } = req.query;
//   console.log('Received request for random animals');
//   console.log('Exclude animals:', excludeAnimals);

//   // Check if excludeAnimals exists and if it's not an empty string
//   if (excludeAnimals && excludeAnimals.trim() !== '') {
//     // Convert comma-separated excludeAnimals string to an array
//     const excludeAnimalsArray = excludeAnimals.split(',');

//     // Generate the LIKE pattern for each animal to be excluded
//     const excludePatterns = excludeAnimalsArray.map((animal) => `%${animal.trim()}%`);
//     console.log('Exclude Patterns:', excludePatterns);

//     // Query to fetch 6 random ImageURLs from the animals table excluding specific animals
//     const sqlQuery = `SELECT ImageURL FROM animals WHERE 
//       NOT (${excludePatterns.map((pattern) => `AnimalName LIKE ?`).join(' OR ')})
//       ORDER BY RAND() LIMIT 6`;

//     const values = [...excludePatterns];

//     connection.query(sqlQuery, values, (err, results) => {
//       if (err) {
//         console.error('Error executing SQL query:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//       } else {
//         const imageUrlsArray = results.map((row) => row.ImageURL);
//         console.log('Returned 6 pictures:', imageUrlsArray);
//         res.json(imageUrlsArray);
//       }
//     });
//   } else {
//     // If excludeAnimals is not provided or empty, fetch 6 random ImageURLs as before
//     const sqlQuery = 'SELECT ImageURL FROM animals ORDER BY RAND() LIMIT 6';

//     connection.query(sqlQuery, (err, results) => {
//       if (err) {
//         console.error('Error executing SQL query:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//       } else {
//         const imageUrlsArray = results.map((row) => row.ImageURL);
//         console.log('Returned 6 pictures:', imageUrlsArray);
//         res.json(imageUrlsArray);
//       }
//     });
//   }
// });
  
app.get('/randomAnimals', (req, res) => {
  const { excludeAnimals, category } = req.query;
  console.log('Received request for random animals');
  console.log('Exclude animals:', excludeAnimals);

  // Check if excludeAnimals exists and if it's not an empty string
  if (excludeAnimals && excludeAnimals.trim() !== '') {
    // Convert comma-separated excludeAnimals string to an array
    const excludeAnimalsArray = excludeAnimals.split(',');

    // Generate the LIKE pattern for each animal to be excluded
    const excludePatterns = excludeAnimalsArray.map((animal) => `%${animal.trim()}%`);
    console.log('Exclude Patterns:', excludePatterns);

    // Construct the SQL query based on the category
    let sqlQuery = '';
    if (category === 'Animals') {
      sqlQuery = `SELECT ImageURL FROM animals WHERE 
        NOT (${excludePatterns.map((pattern) => `AnimalName LIKE ?`).join(' OR ')})
        ORDER BY RAND() LIMIT 6`;
    } else if (category === 'Food') {
      // Construct the query for the 'Food' category
      // Modify this query based on your table structure for the 'Food' category
      sqlQuery = `SELECT ImageURL FROM food WHERE 
        NOT (${excludePatterns.map((pattern) => `FoodName LIKE ?`).join(' OR ')})
        ORDER BY RAND() LIMIT 6`;
    } else {
      // Handle other categories or return an error if needed
      res.status(400).json({ error: 'Invalid category' });
      return;
    }

    const values = [...excludePatterns];

    connection.query(sqlQuery, values, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        const imageUrlsArray = results.map((row) => row.ImageURL);
        console.log('Returned 6 pictures:', imageUrlsArray);
        res.json(imageUrlsArray);
      }
    });
  } else {
    // If excludeAnimals is not provided or empty, fetch 6 random ImageURLs as before
    let sqlQuery = '';
    if (category === 'Animals') {
      sqlQuery = 'SELECT ImageURL FROM animals ORDER BY RAND() LIMIT 6';
    } else if (category === 'Food') {
      // Construct the query for the 'Food' category
      // Modify this query based on your table structure for the 'Food' category
      sqlQuery = 'SELECT ImageURL FROM food ORDER BY RAND() LIMIT 6';
    } else {
      // Handle other categories or return an error if needed
      res.status(400).json({ error: 'Invalid category' });
      return;
    }

    connection.query(sqlQuery, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        const imageUrlsArray = results.map((row) => row.ImageURL);
        console.log('Returned 6 pictures:', imageUrlsArray);
        res.json(imageUrlsArray);
      }
    });
  }
});


  
  
  
  

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
