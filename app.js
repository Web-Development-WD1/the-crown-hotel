const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const pg = require('pg');
const bodyParser = require('body-parser');
const config = require('./config.js')[process.env.NODE_ENV || 'development'];

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const PORT = 3000;



app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/html/homepage.html'));
});

app.post('/available-rooms', async (req, res) => {
  try {
        console.log('Request received at /available-rooms');
        const pool = new pg.Pool(config);
        const client = await pool.connect();

        await client.query('SET search_path to hotelbooking');
        
        const { checkInDate, checkOutDate } = req.body;

        const query = {
            text: `
                SELECT r.r_no, r.r_class
                FROM room r
                WHERE NOT EXISTS (
                SELECT 1
                FROM roombooking rb
                WHERE r.r_no = rb.r_no
                AND (
                    ($1 BETWEEN rb.checkin AND rb.checkout)
                    OR ($2 BETWEEN rb.checkin AND rb.checkout)
                    OR (rb.checkin BETWEEN $1 AND $2)
                    OR (rb.checkout BETWEEN $1 AND $2)
            )
        );
      `,
          values: [checkInDate, checkOutDate],
    };

    const result = await client.query(query.text, query.values);
    console.log('Query result:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on <http://localhost>:${PORT}`);
})

