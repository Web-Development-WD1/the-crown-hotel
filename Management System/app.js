const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const pool = require('./config.js');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Housekeeper
// Room Management route
app.get('/hk-room-management', async (req, res) => {
  try {
    await pool.query('SET search_path TO hotelbooking');

    // Fetch room data for each room type
    const roomData = {
      'Standard Double Rooms': await fetchRoomData('std_d'),
      'Standard Twin Rooms': await fetchRoomData('std_t'),
      'Superior Double Rooms': await fetchRoomData('sup_d'),
      'Superior Twin Rooms': await fetchRoomData('sup_t'),
    };

    res.render('hk-room-management', { roomData });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

async function fetchRoomData(roomClass) {
  const query = `
    SELECT r_no, r_status
    FROM room
    WHERE r_class = $1 AND (r_status = 'C' OR r_status = 'X');
  `;

  const result = await pool.query(query, [roomClass]);
  return result.rows;
}

// Adding a route handler for the dashboard page
app.get('/hk-dashboard', async (req, res) => {
  try {
     
    await pool.query('SET search_path TO hotelbooking');

    // Fetch rooms to be cleaned
    const room_c_result = await pool.query(`SELECT Count (*) as count from room where r_status = 'C';`);
    const room_c = room_c_result.rows[0].count;

    // Fetch rooms cleaned (available rooms)
    const room_a_result = await pool.query(`SELECT Count (*) as count from room where r_status = 'A';`);
    const room_a = room_a_result.rows[0].count;

    // Fetch reported rooms
    const room_x_result = await pool.query(`SELECT Count (*) as count from room where r_status = 'X';`);
    const room_x = room_x_result.rows[0].count;

    res.render('hk-dashboard', { room_c, room_a, room_x });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Adding a route handler for the hk-clean page, with the r_no passed on as a request parameter
app.get('/hk-clean/:r_no', async (req, res) => {
  try {
    // get the room number from the request parameters
    const { r_no } = req.params;
    await pool.query('SET search_path TO hotelbooking');
    // Fetch r_class based on r_no
    const result = await fetchRoomClass(r_no);
    // Map r_class to user-friendly room type
    const userFriendlyRoomType = mapToUserFriendlyRoomType(result.rows[0].r_class);
    // Render the hk-clean template with r_no and user-friendly room type
    res.render('hk-clean', { r_no, roomType: userFriendlyRoomType });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Adding a another route handler for the hk-reported page
app.get('/hk-reported/:r_no', async (req, res) => {
  try {
    // get the room number from the request parameters
    const { r_no } = req.params;
    await pool.query('SET search_path TO hotelbooking');
    const query = 'SELECT r_notes FROM room WHERE r_no = $1';
    const comment = await pool.query(query, [r_no]);
    // get the r_class from the database based on r_no
    const result = await fetchRoomClass(r_no);
    // map the database r_class (std_d etc) to easily understood versions
    const userFriendlyRoomType = mapToUserFriendlyRoomType(result.rows[0].r_class);
    // render the page, with room number, room type and comment
    res.render('hk-reported', { r_no, roomType: userFriendlyRoomType, comment });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// change room status to available after clicking the button on hk-clean and hk-reported page
app.post('/change-room-to-available/:r_no', async (req, res) => {
  try {
      const { r_no } = req.params;
      await pool.query('SET search_path TO hotelbooking');

      // Update room status to 'A'
      const query = `UPDATE room SET r_status = $1, r_notes = '', clean_by = '' WHERE r_no = $2`;
      await pool.query(query, ['A', r_no]);

      res.status(200).json({
        success: true,
        message: 'Room status updated successfully'
      });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Internal Server Error');
  }
});

// added another route handler to handle the report room function in the 'clean' page
app.post('/report-room/:r_no', async (req, res) => {
  try {
    const { r_no } = req.params;
// get the comment the user wrote
    const { comment } = req.body;
    await pool.query('SET search_path TO hotelbooking');
    // update room status to 'X' and set r_notes to the comment (which the user wrote in the hk-clean page)
    const query = 'UPDATE room SET r_status = $1, r_notes = $2 WHERE r_no = $3';
    await pool.query(query, ['X', comment, r_no]);
    res.status(200).json({
      success: true,
      message: 'Thank you. The issue has been reported.'});
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/update-comment/:r_no', async (req, res) => {
  try {
    const { r_no } = req.params;
// get the comment the user wrote (edited version)
    const { updatedComment } = req.body;
    await pool.query('SET search_path TO hotelbooking');
    // Update room status to 'X' and set r_notes to the comment (which the user wrote in the hk-clean page)
    const query = 'UPDATE room SET r_notes = $1 WHERE r_no = $2';
    await pool.query(query, [updatedComment, r_no]);
    res.status(200).send('Updated successfully');
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// mapping database room types (std_t etc.) to easily understood versions
function mapToUserFriendlyRoomType(r_class) {
  switch (r_class) {
    case 'std_d':
      return 'Standard Double Room';
    case 'std_t':
      return 'Standard Twin Room';
    case 'sup_d':
      return 'Superior Double Room';
    case 'sup_t':
      return 'Superior Twin Room';
    default:
      return 'Unknown Room Type';
  }
}

async function fetchRoomClass(r_no) {
  const query = `
    SELECT r_class
    FROM room
    WHERE r_no = $1;
  `;

  const result = await pool.query(query, [r_no]);
  return result;
}

// Receptionist
app.get('/', async (req, res) => {
  try {
     
    await pool.query('SET search_path TO hotelbooking');

    // Fetch pending arrival guest
    const b_ref_p_result = await pool.query(`SELECT COUNT (*) as count from booking where b_status = 'P';`);
    const b_ref_p = b_ref_p_result.rows[0].count;

    // Fetch rooms to be cleaned (check-out rooms)
    const room_c_results = await pool.query(`SELECT COUNT (*) as count from room where r_status = 'C' AND clean_by != '';`);
    const room_c_s = room_c_results.rows[0].count;

    // Fetch payment collected
    const payment_result = await pool.query(`SELECT SUM(b_outstanding) as total from booking where b_status = 'L';`);
    const payment_l = payment_result.rows[0].total;

    res.render('rep-dashboard', { b_ref_p, room_c_s, payment_l });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Adding a route handler for the dashboard page
app.get('/rep-dashboard', async (req, res) => {
  try {
     
    await pool.query('SET search_path TO hotelbooking');

    // Fetch pending arrival guest
    const b_ref_p_result = await pool.query(`SELECT COUNT (*) as count from booking where b_status = 'P';`);
    const b_ref_p = b_ref_p_result.rows[0].count;

    // Fetch rooms to be cleaned (check-out rooms)
    const room_c_results = await pool.query(`SELECT COUNT (*) as count from room where r_status = 'C' AND clean_by != '';`);
    const room_c_s = room_c_results.rows[0].count;

    // Fetch payment collected
    const payment_result = await pool.query(`SELECT SUM(b_cost) as total from booking where b_status = 'L';`);
    const payment_l = payment_result.rows[0].total;
    

    res.render('rep-dashboard', { b_ref_p, room_c_s, payment_l });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Room Management route
app.get('/room-management', async (req, res) => {
  try {
       
      await pool.query('SET search_path TO hotelbooking');

      // Retrieve room data from the database
      const query = `SELECT * FROM room ORDER BY r_no;`;
      const result = await pool.query(query);
      const roomData = result.rows;

      // Map room data to include full room descriptions
      const mappedRoomData = roomData.map(room => ({
          r_no: room.r_no,
          r_class: showRoomDesc(room.r_class),
          r_status: showRoomStatus(room.r_status),
          r_notes: room.r_notes,
          clean_by: room.clean_by,
      }));

      res.render('room-management', { roomData: mappedRoomData });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Internal Server Error');
  }
});

function showRoomDesc(r_class) {
  switch (r_class) {
      case 'std_d':
          return 'Standard Double Room';
      case 'std_t':
          return 'Standard Twin Room';
      case 'sup_d':
          return 'Superior Double Room';
      case 'sup_t':
          return 'Superior Twin Room';
      default:
          return 'Unknown Room Type';
  }
}

function showRoomStatus(r_status) {
  switch (r_status) {
      case 'A':
          return 'Available';
      case 'O':
          return 'Occupied';
      case 'C':
          return 'Checked-out';
      case 'X':
          return 'Unavailable';
      default:
          return 'Unknown Status';
  }
}

// Customer Reservation route
app.get('/customer-reservation', async (req, res) => {
  try {
       
      await pool.query('SET search_path TO hotelbooking');

      // Retrieve booking data from the database
      const query = `SELECT b.b_ref, c.c_name, c.c_email, rb.checkin, b_status
                      FROM booking b 
                      JOIN roombooking rb ON rb.b_ref = b.b_ref
                      JOIN customer c ON b.c_no = c.c_no 
                      AND (b.b_status = 'P' OR b.b_status = 'C')
                      GROUP BY b.b_ref, c.c_name, c.c_email, rb.checkin, b_status
                      ORDER BY checkin ASC;`;
      const result = await pool.query(query);
      const bookData = result.rows;

      // Map booking data to include full status descriptions
      const mappedBookData = bookData.map(book => ({
          b_ref: book.b_ref,
          c_name: book.c_name,
          c_email: book.c_email,
          checkin: new Date(book.checkin).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          }),
          b_status: showGuestStatus(book.b_status),
      }));

      res.render('customer-reservation', { bookData: mappedBookData });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Internal Server Error');
  }
});

function showGuestStatus(b_status) {
  switch (b_status) {
      case 'P':
          return 'Pending Arrival';
      case 'C':
          return 'Checked-in';
      default:
          return 'Unknown Status';
  }
}

// booking-details
app.get('/booking-details/:b_ref', async (req, res) => {
  try {
      const { b_ref } = req.params;
       
      await pool.query('SET search_path TO hotelbooking');

      // Retrieve customer details
      const Query1 = `
          SELECT c.c_name, c.c_address, c.c_email, c.c_cardno, c.c_cvc, c.c_cardexp 
          FROM customer c, booking b 
          WHERE c.c_no = b.c_no AND b.b_ref = $1;
      `;
      const result1 = await pool.query(Query1, [b_ref]);
      const customerDetails = result1.rows[0];

      // Retrieve booking details
      const Query2 = `
          SELECT rb.checkin, rb.checkout, rb.checkout - rb.checkin AS no_nights, 
              b.b_cost as total_price, b.b_notes as notes 
          FROM booking b, roombooking rb 
          WHERE b.b_ref = $1 AND rb.b_ref = b.b_ref;
      `;
      const result2 = await pool.query(Query2, [b_ref]);
      const bookDetails = result2.rows[0];

      // Retrieve room allocation details
      const Query3 = `
          SELECT r.r_class, rb.r_no 
          FROM room r, roombooking rb 
          WHERE rb.b_ref = $1 AND rb.r_no = r.r_no;
      `;
      const result3 = await pool.query(Query3, [b_ref]);
      const roomAllocation = result3.rows;

      // Map booking details for rendering
      const mappedBookDetail = {
          c_name: customerDetails.c_name,
          c_address: customerDetails.c_address,
          c_email: customerDetails.c_email,
          c_cardno: customerDetails.c_cardno,
          c_cvc: customerDetails.c_cvc,
          c_cardexp: customerDetails.c_cardexp,
          checkin: new Date(bookDetails.checkin).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          }),
          checkout: new Date(bookDetails.checkout).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          }),
          no_nights: bookDetails.no_nights,
          total_price: bookDetails.total_price,
          notes: bookDetails.notes,
          rooms: roomAllocation.map((room) => ({
              r_class: showRoomDesc(room.r_class),
              r_no: room.r_no,
          })),
      };
      res.render('booking-details', { b_ref, mappedBookDetail });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Internal Server Error');
  }
});

async function fetchRoomClass(r_no) {
  const query = `
      SELECT r_class
      FROM room
      WHERE r_no = $1;`;
  
  const result = await pool.query(query, [r_no]);
  return result;
}

// booking-details-check-out
app.get('/booking-details-check-out/:b_ref', async (req, res) => {
  try {
      const { b_ref } = req.params;

      await pool.query('SET search_path TO hotelbooking');

      // Retrieve customer details
      const Query1 = `
          SELECT c.c_name, c.c_address, c.c_email, c.c_cardno, c.c_cvc, c.c_cardexp 
          FROM customer c, booking b 
          WHERE c.c_no = b.c_no AND b.b_ref = $1;
      `;
      const result1 = await pool.query(Query1, [b_ref]);
      const customerDetails = result1.rows[0];

      // Retrieve booking details
      const Query2 = `
          SELECT rb.checkin, rb.checkout, rb.checkout - rb.checkin AS no_nights, 
          b.b_outstanding as total_price, b.b_notes as notes 
          FROM booking b, roombooking rb 
          WHERE b.b_ref = $1 AND rb.b_ref = b.b_ref;
      `;
      const result2 = await pool.query(Query2, [b_ref]);
      const bookDetails = result2.rows[0];

      // Retrieve room allocation details
      const Query3 = `
          SELECT r.r_class, rb.r_no, rt.price,
          rt.price * (rb.checkout - rb.checkin) AS total
          FROM room r, roombooking rb, rates rt, booking b
          WHERE rb.b_ref = $1 AND rb.r_no = r.r_no
          AND r.r_class = rt.r_class AND b.b_ref = rb.b_ref;
      `;
      const result3 = await pool.query(Query3, [b_ref]);
      const roomAllocation = result3.rows;

      const Query4 = `
          SELECT rb.r_no, ira.item, ira.price, iro.itemqty, ira.price * iro.itemqty AS total
          FROM room r, itemrates ira, itemroom iro, booking b, roombooking rb
          WHERE rb.b_ref = $1 AND rb.r_no = r.r_no AND b.b_ref = rb.b_ref AND ira.item = iro.item AND iro.r_no = r.r_no;
      `;
      const result4 = await pool.query(Query4, [b_ref]);
      const itemDetail = result4.rows;

      // Map booking details for rendering
      const mappedBookDetail = {
          c_name: customerDetails.c_name,
          c_address: customerDetails.c_address,
          c_email: customerDetails.c_email,
          c_cardno: customerDetails.c_cardno,
          c_cvc: customerDetails.c_cvc,
          c_cardexp: customerDetails.c_cardexp,
          checkin: new Date(bookDetails.checkin).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          }),
          checkout: new Date(bookDetails.checkout).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          }),
          no_nights: bookDetails.no_nights,
          total_price: bookDetails.total_price,
          notes: bookDetails.notes,
          rooms: roomAllocation.map((room) => ({
              r_class: showRoomDesc(room.r_class),
              r_no: room.r_no,
              price: room.price,
              total: room.total,
          })),
          itemDetail: itemDetail.map(item => ({
            r_no: item.r_no,
            item: item.item,
            price: item.price,
            itemqty: item.itemqty,
            total: item.total
        })),
      };
      res.render('booking-details-check-out', { b_ref, mappedBookDetail });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Internal Server Error');
  }
});

// new reservation
app.get('/cr-new-reservation', async (req, res) => {
  try {
  res.render('cr-new-reservation');
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/submit-form', async (req, res) => {
  try {
  const {
    checkinDate,
    checkoutDate,
    rno,
    fname,
    lname,
    email,
    address,
    note,
    cardno,
    cardexp,
    cvc,
    totalPrice
  } = req.body;

  console.log("Received form data:", req.body);

  const customerQuery = `
  INSERT INTO hotelbooking.customer
  VALUES (
      (SELECT MAX(c_no) FROM hotelbooking.customer) + 1,
      $1, $2, $3, $4, $5, $6);`;

  console.log("Executing customer query:", customerQuery);

  await pool.query(customerQuery, [
    `${fname} ${lname}`,
    email,
    address,
    parseInt(cvc),
    cardexp,
    cardno,
  ]);

  console.log("Customer details inserted successfully.");

  const bookingQuery = `
  INSERT INTO hotelbooking.booking (b_ref, c_no, b_cost, b_outstanding, b_notes, b_status)
  VALUES ((SELECT MAX(b_ref) FROM hotelbooking.booking) + 1,
  (SELECT MAX(c_no) FROM hotelbooking.customer), $1, $1, $2, 'P');`;

  console.log("Executing booking query:", bookingQuery);

  await pool.query(bookingQuery, [parseInt(totalPrice), note]);

  console.log("Booking details inserted successfully.");

  const roomBookingQuery = `
    INSERT INTO hotelbooking.roombooking (r_no, b_ref, checkin, checkout)
    VALUES ($1, (SELECT MAX(b_ref) FROM hotelbooking.booking), $2, $3);`;

  console.log("Executing room booking query:", roomBookingQuery);

  await pool.query(roomBookingQuery, [rno, checkinDate, checkoutDate]);

  console.log("Room booking details inserted successfully.");

  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Internal Server Error');
  }
});


app.post('/get-available-rooms', async (req, res) => {
  try {
    const { checkin, checkout, rtype } = req.body;

    await pool.query('SET search_path TO hotelbooking');

    const availableRooms = await pool.query(
      `SELECT r_no
       FROM room
       WHERE r_class = $1
         AND r_status = 'A'
         AND r_no NOT IN (
           SELECT r_no
           FROM roombooking
           WHERE $2 < checkout
             AND $3 > checkin
         )`,
      [rtype, checkout, checkin]
    );

    res.json({ availableRooms: availableRooms.rows });

  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });     

// calculate total price
app.post('/calculate-total-price', async (req, res) => {
  try {
      const { night, rtype } = req.body;

      await pool.query('SET search_path TO hotelbooking');

      const totalPriceResult = await pool.query(
          `SELECT rt.price * $1 AS totalprice 
          FROM rates rt WHERE r_class = $2`,
          [night, rtype]
      );

      const totalPrice = totalPriceResult.rows[0].totalprice;

      res.json({ totalPrice });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/check-in', async (req, res) => {
  res.render('check-in');
});

// check-in shortcut
app.get('/check-in-data/:b_ref_input', async (req, res) => {
  try {
      const { b_ref_input } = req.params;
      
      await pool.query('SET search_path TO hotelbooking');

      const query = `SELECT b.b_ref
                      FROM booking b 
                      JOIN roombooking rb ON rb.b_ref = b.b_ref
                      JOIN customer c ON b.c_no = c.c_no 
                      AND (b.b_status = 'P' OR b.b_status = 'C')
                      GROUP BY b.b_ref, c.c_name, c.c_email, rb.checkin, b_status
                      ORDER BY checkin ASC;`;
      const result = await pool.query(query);

      const exists = result.rows.some(row => row.b_ref === parseInt(b_ref_input, 10));

      res.json({ exists });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// assign-cleaning route
app.get('/assign-cleaning/:r_no', async (req, res) => {
  try {
      const { r_no } = req.params;

      await pool.query('SET search_path TO hotelbooking');

      const customerDetailsQuery = `
          SELECT c.c_name, c.c_address, c.c_email, c.c_cardno, c.c_CVC, c.c_cardexp
          FROM customer c, booking b, roombooking rb, room r
          WHERE rb.r_no = $1 AND rb.r_no = r.r_no AND r.r_status = 'C' AND b.b_status = 'L'
          AND c.c_no = b.c_no AND rb.b_ref = b.b_ref
          ORDER BY checkout DESC
          LIMIT 1;
      `;
      const result1 = await pool.query(customerDetailsQuery, [r_no]);
      const customerDetails = result1.rows[0];

      const bookingDetailsQuery = `
          SELECT b.b_ref, rb.checkin, rb.checkout, rb.checkout-rb.checkin AS no_nights, b.b_cost as total_price, b.b_notes as notes, r.r_no
          FROM booking b, roombooking rb, room r
          WHERE rb.r_no = $1 AND rb.r_no = r.r_no AND r.r_status = 'C' AND b.b_status = 'L'
          AND rb.b_ref = b.b_ref
          ORDER BY checkout DESC
          LIMIT 1;
      `;
      const result2 = await pool.query(bookingDetailsQuery, [r_no]);
      const bookDetails = result2.rows[0];

      const roomResult = await fetchRoomClass(r_no);
      const roomDesc = showRoomDesc(roomResult.rows[0].r_class);
      const clean_by = roomResult.rows[0].clean_by;

      const cleaningData = {
          c_name: customerDetails.c_name,
          c_address: customerDetails.c_address,
          c_email: customerDetails.c_email,
          c_cardno: customerDetails.c_cardno,
          c_cvc: customerDetails.c_cvc,
          c_cardexp: customerDetails.c_cardexp,
          b_ref: bookDetails.b_ref,
          checkin: new Date(bookDetails.checkin).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          }),
          checkout: new Date(bookDetails.checkout).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          }),
          no_nights: bookDetails.no_nights,
          total_price: bookDetails.total_price,
          notes: bookDetails.notes,
      };
      res.render('assign-cleaning', { r_no, cleaningData, roomType: roomDesc, clean_by });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Internal Server Error');
  }
});

// room-details
app.get('/room-details/:r_no', async (req, res) => {
  try {
    const { r_no } = req.params;

    await pool.query('SET search_path TO hotelbooking');

    const customerDetailsQuery = `
        SELECT c.c_name, c.c_address, c.c_email, c.c_cardno, c.c_CVC, c.c_cardexp
        FROM customer c, booking b, roombooking rb, room r
        WHERE rb.r_no = $1 AND rb.r_no = r.r_no AND r.r_status = 'O' AND b.b_status = 'C'
        AND c.c_no = b.c_no AND rb.b_ref = b.b_ref
        ORDER BY checkout DESC
        LIMIT 1;
    `;
    const result1 = await pool.query(customerDetailsQuery, [r_no]);
    const customerDetails = result1.rows[0];

    const bookingDetailsQuery = `
        SELECT b.b_ref, rb.checkin, rb.checkout, rb.checkout-rb.checkin AS no_nights, b.b_cost as total_price, b.b_notes as notes, r.r_no, r.clean_by
        FROM booking b, roombooking rb, room r
        WHERE rb.r_no = $1 AND rb.r_no = r.r_no AND r.r_status = 'O' AND b.b_status = 'C'
        AND rb.b_ref = b.b_ref
        ORDER BY checkout DESC
        LIMIT 1;
    `;
    const result2 = await pool.query(bookingDetailsQuery, [r_no]);
    const bookDetails = result2.rows[0];

    const itemQuery = `
        SELECT ira.item, ira.price, iro.itemqty, ira.price * iro.itemqty AS total
        FROM room r, itemrates ira, itemroom iro, booking b, roombooking rb
        WHERE rb.b_ref = $1 AND rb.r_no = $2 AND rb.r_no = r.r_no AND b.b_ref = rb.b_ref AND ira.item = iro.item AND iro.r_no = r.r_no;
    `;
    const result3 = await pool.query(itemQuery, [bookDetails.b_ref, r_no]);
    const itemDetails = result3.rows;

    const roomResult = await fetchRoomClass(r_no);
    const roomDesc = showRoomDesc(roomResult.rows[0].r_class);
    const clean_by = roomResult.rows[0].clean_by;

    const roomDetails = {
      c_name: customerDetails.c_name,
      c_address: customerDetails.c_address,
      c_email: customerDetails.c_email,
      c_cardno: customerDetails.c_cardno,
      c_cvc: customerDetails.c_cvc,
      c_cardexp: customerDetails.c_cardexp,
      b_ref: bookDetails.b_ref,
      checkin: new Date(bookDetails.checkin).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      checkout: new Date(bookDetails.checkout).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      no_nights: bookDetails.no_nights,
      total_price: bookDetails.total_price,
      notes: bookDetails.notes,
      clean_by: bookDetails.clean_by,
      itemDetails: itemDetails.map(item => ({
        r_no: item.r_no,
        item: item.item,
        price: item.price,
        itemqty: item.itemqty,
        total: item.total
      })),
    };
    res.render('room-details', { r_no, roomDetails, roomType: roomDesc });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// add item to room
app.post('/room-details/:r_no/add-item/:b_ref', async (req, res) => {
  try {
      const r_no = req.params.r_no;
      const items = req.body.items;
      const b_ref = req.params.b_ref;

      await pool.query('SET search_path TO hotelbooking');

      for (const { itemName, itemQty } of items) {
          const existingItemQuery = `SELECT itemqty FROM itemroom WHERE r_no = $1 AND item = $2`;
          const existingItemResult = await pool.query(existingItemQuery, [r_no, itemName]);

          if (existingItemResult.rows.length > 0) {
              const updateQuery = `UPDATE itemroom SET itemqty = itemqty + $1 WHERE r_no = $2 AND item = $3`;
              await pool.query(updateQuery, [itemQty, r_no, itemName]);
          } else {
              const insertQuery = `INSERT INTO itemroom VALUES ($1, $2, $3)`;
              await pool.query(insertQuery, [r_no, itemName, itemQty]);
        }
      }

      const updateBalance = `UPDATE booking
      SET b_outstanding = b_outstanding + 
      (
        SELECT SUM(ira.price * iro.itemqty) 
        FROM room r
        JOIN roombooking rb ON rb.r_no = r.r_no
        JOIN booking b ON b.b_ref = rb.b_ref
        JOIN itemroom iro ON iro.r_no = r.r_no
        JOIN itemrates ira ON ira.item = iro.item
        WHERE rb.b_ref = $1
      )
      WHERE b_ref = $1;`
      await pool.query(updateBalance, [b_ref]);

      res.status(201).json({ success: true, message: 'Items added or updated successfully' });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// delete item
app.delete('/room-details/:r_no/delete-item/:b_ref', async (req, res) => {
  const { r_no } = req.params;
  const { b_ref } = req.params;
  const itemName = req.body.itemName;

  try {
    await pool.query('SET search_path TO hotelbooking');
    const result = await pool.query('DELETE FROM itemroom WHERE item = $1 AND r_no = $2', [itemName, r_no]);
    
    const updateBalance = `UPDATE booking
    SET b_outstanding = b_cost + COALESCE(
      (
        SELECT SUM(ira.price * iro.itemqty) 
        FROM room r
        JOIN roombooking rb ON rb.r_no = r.r_no
        JOIN booking b ON b.b_ref = rb.b_ref
        JOIN itemroom iro ON iro.r_no = r.r_no
        JOIN itemrates ira ON ira.item = iro.item
        WHERE rb.b_ref = $1
      ), 0)
    WHERE b_ref = $1;`
    await pool.query(updateBalance, [b_ref]);
    
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// update booking status to checked-in after clicking the button
app.post('/update-book-status/:b_ref', async (req, res) => {
  try {
      const { b_ref } = req.params;

      await pool.query('SET search_path TO hotelbooking');
      const query1 = `
          UPDATE room r
          SET r_status = 'O'
          FROM booking b, roombooking rb
          WHERE b.b_ref = $1 AND b.b_ref = rb.b_ref AND rb.r_no = r.r_no;`;
      await pool.query(query1, [b_ref]);

      const query2 = `UPDATE booking
                      SET b_status = $1
                      WHERE b_ref = $2;`;
      await pool.query(query2, ['C', b_ref]);

      res.status(200).send('Booking status updated successfully');
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Internal Server Error');
  }
});

// update room status to checked-out after clicking the button
app.post('/proceed-check-out/:b_ref', async (req, res) => {
  try {
      const { b_ref } = req.params;

      await pool.query('SET search_path TO hotelbooking');
      const query1 = `
          UPDATE room r
          SET r_status = 'C'
          FROM booking b, roombooking rb
          WHERE b.b_ref = $1 AND b.b_ref = rb.b_ref AND rb.r_no = r.r_no;`;
      await pool.query(query1, [b_ref]);

      const query2 = `UPDATE booking
                      SET b_status = 'L', b_outstanding = '0'
                      WHERE b_ref = $1;`;
      await pool.query(query2, [b_ref]);

      res.status(200).send('Successfully checked-out');
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/assign-housekeeper/:r_no', async (req, res) => {
  try {
      const { r_no } = req.params;
      const { clean_by } = req.body;

      if (!r_no || !clean_by) {
          return res.status(400).json({ error: 'Invalid request. Missing parameters.' });
      }

      await pool.query('SET search_path TO hotelbooking');

      const updateQuery = 'UPDATE room SET clean_by = $1 WHERE r_no = $2';
      await pool.query(updateQuery, [clean_by, r_no]);

      res.status(200).json({ success: true, clean_by });
  } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});