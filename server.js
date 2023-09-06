const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();



app.use(bodyParser.json());
app.use(cors());


app.use(cors({
  origin: 'http://localhost:8100',
}));

//const port = 3333;

// const connection = mysql.createConnection({
//   host: '127.0.0.1',
//   user: 'root',
//   password: 'password',
//   database: 'gamedb',
// });

const port = 3306;
const connection = mysql.createConnection({
  host: 'gamedb.cbgja1mg2wpp.us-east-1.rds.amazonaws.com',
  user: 'mixitAdmin',
  password: 'mixitPassword',
  database: 'gamedb',
});



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
  
  // Define an API endpoint to fetch the image URLs from the mixedAnimal table
app.get('/mixedAnimal', (req, res) => {
  const category = req.query.category; // Get the 'category' query parameter
  console.log('Received request for mixed animals'); // Add this line for debugging
  
  // Construct the SQL query based on the category
  let sqlQuery = '';
  if (category === 'Animals') {
    sqlQuery = 'SELECT FirstAnimal, SecondAnimal, ImageURL FROM mixedAnimal ORDER BY RAND() LIMIT 10';
  } 
  else if (category === 'Food') {
    // Construct the query for the 'Food' category
    // Modify this query based on your table structure for the 'Food' category
    sqlQuery = 'SELECT FirstAnimal, SecondAnimal, ImageURL FROM mixedFood ORDER BY RAND() LIMIT 10';
  }
  else if (category === 'People') {
    // Construct the query for the 'Food' category
    // Modify this query based on your table structure for the 'Food' category
    sqlQuery = 'SELECT FirstAnimal, SecondAnimal, ImageURL FROM mixedPeople ORDER BY RAND() LIMIT 10';
  } 
  else if (category === 'Movies') {
    // Construct the query for the 'Food' category
    // Modify this query based on your table structure for the 'Food' category
    sqlQuery = 'SELECT FirstAnimal, SecondAnimal, ImageURL FROM mixedMovies ORDER BY RAND() LIMIT 10';
  } 
  else {
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



  
  app.get('/specificAnimals', (req, res) => {
    const { firstAnimal, secondAnimal, category } = req.query;
    console.log('Received request for specific animals:', firstAnimal, secondAnimal, category);
  
    // Construct the SQL query based on the category
    let sqlQuery = '';
    let tableName = '';
  
    if (category === 'Animals') {
      sqlQuery = `SELECT ImageURL FROM animals WHERE AnimalName IN (?, ?)`;
      tableName = 'animals';
    } 
    else if (category === 'Food') {
      // Construct the query for the 'Food' category
      // Modify this query and tableName based on your table structure for the 'Food' category
      sqlQuery = `SELECT ImageURL FROM food WHERE AnimalName IN (?, ?)`;
      tableName = 'food';
    }
    else if (category === 'People') {
      // Construct the query for the 'Food' category
      // Modify this query and tableName based on your table structure for the 'Food' category
      sqlQuery = `SELECT ImageURL FROM people WHERE AnimalName IN (?, ?)`;
      tableName = 'people';
    } 
    else if (category === 'Movies') {
      // Construct the query for the 'Food' category
      // Modify this query and tableName based on your table structure for the 'Food' category
      sqlQuery = `SELECT ImageURL FROM movies WHERE AnimalName IN (?, ?)`;
      tableName = 'movies';
    } 
    else {
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
    } 
    else if (category === 'Food') {
      // Construct the query for the 'Food' category
      // Modify this query based on your table structure for the 'Food' category
      sqlQuery = `SELECT ImageURL FROM food WHERE 
        NOT (${excludePatterns.map((pattern) => `AnimalName LIKE ?`).join(' OR ')})
        ORDER BY RAND() LIMIT 6`;
    }
    else if (category === 'People') {
      // Construct the query for the 'Food' category
      // Modify this query based on your table structure for the 'Food' category
      sqlQuery = `SELECT ImageURL FROM people WHERE 
        NOT (${excludePatterns.map((pattern) => `AnimalName LIKE ?`).join(' OR ')})
        ORDER BY RAND() LIMIT 6`;
    } 
    else if (category === 'Movies') {
      // Construct the query for the 'Food' category
      // Modify this query based on your table structure for the 'Food' category
      sqlQuery = `SELECT ImageURL FROM movies WHERE 
        NOT (${excludePatterns.map((pattern) => `AnimalName LIKE ?`).join(' OR ')})
        ORDER BY RAND() LIMIT 6`;
    } 
    else {
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
    } 
    else if (category === 'Food') {
      // Construct the query for the 'Food' category
      // Modify this query based on your table structure for the 'Food' category
      sqlQuery = 'SELECT ImageURL FROM food ORDER BY RAND() LIMIT 6';
    }
    else if (category === 'People') {
      // Construct the query for the 'Food' category
      // Modify this query based on your table structure for the 'Food' category
      sqlQuery = 'SELECT ImageURL FROM people ORDER BY RAND() LIMIT 6';
    } 
    else if (category === 'Movies') {
      // Construct the query for the 'Food' category
      // Modify this query based on your table structure for the 'Food' category
      sqlQuery = 'SELECT ImageURL FROM movies ORDER BY RAND() LIMIT 6';
    }
    else {
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
