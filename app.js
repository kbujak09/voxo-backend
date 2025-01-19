const express = require('express');

const app = express();
const PORT = 5000;

app.listen(PORT, (error) => {
  if (!error) {
    console.log(`App listening on port: ${PORT}`);
  }
  else {
    console.log("Error occurred, server can't start");
  }
});