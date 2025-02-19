const express = require('express');
const connectDB = require('./db');

const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const app = express();
const PORT = 5000;

connectDB();

app.listen(PORT, (error) => {
  if (!error) {
    console.log(`App listening on port: ${PORT}`);
  }
  else {
    console.log("Error occurred, server can't start");
  }
});

app.use('/', usersRouter);
app.use('/', authRouter);