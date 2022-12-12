const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { v4: uuidv4 } = require('uuid');
const { json } = require('body-parser');

const PORT = process.env.PORT || 3011;

const app = express();

const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

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

//get notes
app.get('/api/notes', (req, res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

//get specific note
app.get('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    readFromFile('./db/db.json')
    .then((data) => JSON.parse(data))
    .then((json) => {
        const result = json.filter((note) => note.id === noteId);
        return result.length > 0
            ? res.json(result)
            : res.json('No note with that ID');
    });
});

//post notes
app.post('/api/notes', (req, res) => {

    // Destructuring assignment for the items in req.body
    const { title, text } = req.body;

    // If all the required properties are present
    if (title && text) {
        // Variable for the object we will save
        const newNote = {
            title,
            text,
            id: uuidv4(),
            //need this to match the index.js file at line 56. WTH dude
        };

        // Obtain existing notes
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                // Convert string into JSON object
                const parsedNotes = JSON.parse(data);

                // Add a new review
                parsedNotes.push(newNote);

                // Write updated reviews back to the file
                fs.writeFile(
                    './db/db.json',
                    JSON.stringify(parsedNotes, null, 2),
                    (writeErr) =>
                        writeErr
                            ? console.error(writeErr)
                            : console.info('Successfully updated notes!')
                );
            }
        });

        const response = {
            status: 'success',
            body: newNote,
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting review');
    }
});

//delete notes
app.delete('/api/notes/:id', (req, res) =>{
    const noteId = req.params.id;
    readFromFile('./db/db.json')
    .then((data) => JSON.parse(data))
    .then((json) => {
        const result = json.filter((note) => note.id !== noteId);

        writeToFile('./db/db.json', result);
        
        res.json(`Item ${noteId} has been deleted 🗑️`);
    })
});

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);