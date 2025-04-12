const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "train_booking",
  password: "1786",
  port: 5432,
});

module.exports = pool;
