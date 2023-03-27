const express = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => res.send('Yo boi!!'))

function keepAlive() {
  app.listen(port, () =>
  console.log(`Your app is listening a http://localhost:${port}`));
}

module.exports = keepAlive;