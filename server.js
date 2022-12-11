const express = require('express');
const path = require('path');

const db = require('./db/db.json')
const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

//route for homepage (index.html)
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

//route for notes page (notes.html)
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, 'public/notes.html'))
);

app.get('/api/notes', (req, res) => res.json(db));

app.post('/api/notes', (req, res) => res.json(db));

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);