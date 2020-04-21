const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const cors = require('cors');
const bodyParser = require('body-parser');
const Auth = require('./routes/Auth');

// static file declaration
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(cors());
// production mode
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  //
  app.get('*', (req, res) => {
    res.sendfile(path.join((__dirname = 'client/build/index.html')));
  });
}

app.use(bodyParser.json());

// build mode
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/public/index.html'));
});

app.use('/auth', Auth);

app.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
