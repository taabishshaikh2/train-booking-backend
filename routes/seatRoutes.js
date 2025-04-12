const express = require("express");
const db = require("../db");

const router = express.Router();
const authenticate = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM seats ORDER BY row_number, seat_number");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


// Book seats
// router.post("/book", authenticate, async (req, res) => {
//   const { userId, numSeats } = req.body;
//   console.log("Request Body:", req.body); // Log received data
//   console.log("Seats received:", req.body.seats);
//   console.log("User ID:", req.user.id);

//   if (numSeats > 7) return res.status(400).json({ error: "Max 7 seats per booking" });

//   const availableSeats = await db.query("SELECT * FROM seats WHERE is_reserved = FALSE ORDER BY row_number, seat_number");

//   if (availableSeats.rows.length < numSeats) return res.status(400).json({ error: "Not enough available seats" });

//   const seatsToBook = [];
//   let prevRow = null;

//   for (let seat of availableSeats.rows) {
//       if (prevRow === null || prevRow === seat.row_number) {
//           seatsToBook.push(seat.id);
//           prevRow = seat.row_number;
//       }
//       if (seatsToBook.length === numSeats) break;
//   }

//   await db.query("UPDATE seats SET is_reserved = TRUE, reserved_by = $1 WHERE id = ANY($2)", [userId, seatsToBook]);
//   await db.query("INSERT INTO bookings (user_id, seat_ids) VALUES ($1, $2)", [userId, seatsToBook]);

//   res.json({ message: "Seats booked", bookedSeats: seatsToBook });
// });
// router.post("/book", authenticate, async (req, res) => {
//   const { userId, numSeats } = req.body;

//   if (numSeats > 7) return res.status(400).json({ error: "Max 7 seats per booking" });

//   // Fetch all available seats ordered by row_number, seat_number
//   const availableSeats = await db.query("SELECT * FROM seats WHERE is_reserved = FALSE ORDER BY row_number, seat_number");

//   if (availableSeats.rows.length < numSeats) {
//     return res.status(400).json({ error: "Not enough available seats" });
//   }

//   // Group seats by row number
//   const rowMap = {};
//   for (let seat of availableSeats.rows) {
//     if (!rowMap[seat.row_number]) rowMap[seat.row_number] = [];
//     rowMap[seat.row_number].push(seat);
//   }

//   let seatsToBook = [];

//   // Try to find a continuous block of seats in any row
//   for (let row in rowMap) {
//     const sortedRowSeats = rowMap[row].sort((a, b) => a.seat_number - b.seat_number); // Ensure seat_number order

//     let availableBlock = [];

//     // Loop through the row to find a continuous block of seats
//     for (let i = 0; i < sortedRowSeats.length; i++) {
//       const seat = sortedRowSeats[i];

//       // Check for continuous seats
//       if (availableBlock.length === 0 || seat.seat_number === availableBlock[availableBlock.length - 1].seat_number + 1) {
//         availableBlock.push(seat);
//       } else {
//         // Reset the available block
//         availableBlock = [seat];
//       }

//       // If we find a block with enough seats, break the loop
//       if (availableBlock.length === numSeats) {
//         seatsToBook = availableBlock.map(s => s.id);
//         break;
//       }
//     }

//     if (seatsToBook.length > 0) break; // If seats were found, stop searching
//   }

//   // If no block of seats is found in a single row, attempt to book across rows
//   if (seatsToBook.length === 0) {
//     let allAvailableSeats = [];
//     for (let row in rowMap) {
//       allAvailableSeats = allAvailableSeats.concat(rowMap[row]);
//     }

//     // Pick the first 'numSeats' available ones
//     allAvailableSeats = allAvailableSeats.filter(s => !s.is_reserved);
//     if (allAvailableSeats.length < numSeats) {
//       return res.status(400).json({ error: "Not enough seats available" });
//     }

//     seatsToBook = allAvailableSeats.slice(0, numSeats).map(s => s.id);
//   }

//   // Update the seats as reserved in the database
//   await db.query("UPDATE seats SET is_reserved = TRUE, reserved_by = $1 WHERE id = ANY($2)", [userId, seatsToBook]);
//   await db.query("INSERT INTO bookings (user_id, seat_ids) VALUES ($1, $2)", [userId, seatsToBook]);

//   res.json({ message: "Seats booked successfully", bookedSeats: seatsToBook });
// });
// router.post("/book", authenticate, async (req, res) => {
//   const { userId, seats } = req.body;
//   console.log("Request Body:", req.body); // Log received data
//   console.log("Seats received:", seats);
//   console.log("User ID:", req.user.id);

//   // Validate max seats per booking
//   if (seats.length > 7) return res.status(400).json({ error: "Max 7 seats per booking" });

//   // Fetch all available seats ordered by row_number and seat_number
//   const availableSeats = await db.query(
//     "SELECT * FROM seats WHERE is_reserved = FALSE AND id = ANY($1) ORDER BY row_number, seat_number",
//     [seats]
//   );

//   // If not enough seats are available, return error
//   if (availableSeats.rows.length !== seats.length) {
//     return res.status(400).json({ error: "Not enough available seats" });
//   }

//   // Proceed to book the seats
//   try {
//     // Update the seats in the database as reserved for the user
//     await db.query("UPDATE seats SET is_reserved = TRUE, reserved_by = $1 WHERE id = ANY($2)", [
//       userId,
//       seats,
//     ]);

//     // Log booking information (for debugging)
//     console.log("Booked seats:", seats);

//     // Insert the booking into the bookings table
//     await db.query("INSERT INTO bookings (user_id, seat_ids) VALUES ($1, $2)", [userId, seats]);

//     // Respond with the booked seats
//     res.json({ message: "Seats booked successfully", bookedSeats: seats });

//   } catch (error) {
//     console.error("Error during booking:", error);
//     res.status(500).json({ error: "Failed to book seats" });
//   }
// });
router.post("/book", authenticate, async (req, res) => {
  const { userId, seats } = req.body;
  console.log("Request Body:", req.body); // Log received data
  console.log("Seats received:", seats);
  console.log("User ID:", req.user.id);

  // Validate max seats per booking
  if (seats.length > 7) return res.status(400).json({ error: "Max 7 seats per booking" });

  // Fetch all available seats ordered by row_number (descending) and seat_number
  const availableSeats = await db.query(
    "SELECT * FROM seats WHERE is_reserved = FALSE ORDER BY row_number , seat_number"
  );

  // Group available seats by row for easier processing
  let availableSeatsByRow = {};
  availableSeats.rows.forEach(seat => {
    if (!availableSeatsByRow[seat.row_number]) {
      availableSeatsByRow[seat.row_number] = [];
    }
    availableSeatsByRow[seat.row_number].push(seat.id);
  });

  // Try to find continuous seats
  let bookedSeats = [];
  
  let rows = Object.keys(availableSeatsByRow).map(Number).sort((a, b) => a - b);
  // Sort rows in descending order(a, b) => b - a
  
  for (let row of rows) {
    let rowSeats = availableSeatsByRow[row];
  
    // Check only rows that have enough seats
    if (rowSeats.length >= seats.length) {
      for (let i = 0; i <= rowSeats.length - seats.length; i++) {
        const slice = rowSeats.slice(i, i + seats.length);
        const isContinuous = slice.every((val, idx) => idx === 0 || val === slice[idx - 1] + 1);
  
        if (isContinuous) {
          bookedSeats = slice;
          break;
        }
      }
  
      if (bookedSeats.length > 0) break;
    }
  }
  

  // If no continuous seats found in rows, pick the first available seats
  if (bookedSeats.length === 0 && availableSeats.rows.length >= seats.length) {
    bookedSeats = availableSeats.rows.slice(0, seats.length).map((seat) => seat.id);
  }

  // If no seats are available to book, return error
  if (bookedSeats.length === 0) {
    return res.status(400).json({ error: "Not enough available seats" });
  }

  // Proceed to book the seats
  try {
    // Update the seats in the database as reserved for the user
    await db.query("UPDATE seats SET is_reserved = TRUE, reserved_by = $1 WHERE id = ANY($2)", [
      userId,
      bookedSeats,
    ]);

    // Log booking information (for debugging)
    console.log("Booked seats:", bookedSeats);

    // Insert the booking into the bookings table
    await db.query("INSERT INTO bookings (user_id, seat_ids) VALUES ($1, $2)", [userId, bookedSeats]);

    // Respond with the booked seats
    res.json({ message: "Seats booked successfully", bookedSeats: bookedSeats });

  } catch (error) {
    console.error("Error during booking:", error);
    res.status(500).json({ error: "Failed to book seats" });
  }
});











// Get available seats grouped by row
router.get("/available", authenticate, async (req, res) => {
  try {
    // Fetch seats grouped by row and filter for unreserved seats
    const rowsQuery = await db.query(
      `SELECT row_number, array_agg(id) AS seats 
       FROM seats 
       WHERE is_reserved = false 
       GROUP BY row_number 
       ORDER BY row_number`
    );

    if (rowsQuery.rows.length === 0) {
      return res.status(404).json({ message: "No available seats." });
    }

    // Return seats grouped by row
    const availableSeatsByRow = rowsQuery.rows.map((row) => ({
      row: row.row_number,
      seats: row.seats, // An array of available seat IDs for this row
    }));

    res.json({ availableSeatsByRow });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


// Reset booking (clears all reservations)
router.post("/reset", authenticate, async (req, res) => {
  try {
    await db.query("UPDATE seats SET is_reserved = false, reserved_by = NULL");
    res.json({ message: "All seat bookings have been reset!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
