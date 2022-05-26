const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // See https://www.mongodb.com/docs/drivers/node/current/quick-start/
const cors = require('cors')
const http = require('http');
const bodyParser = require('body-parser');

const app = express();
app.use(cors()); // Allow all cross-origing requests. More information: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(express.static('public')); // Host all static files in the folder /public
app.use(bodyParser.json()); // Support json encoded bodies
const port = process.env.PORT || '3001'; // Use the PORT variable if set (e.g., when deploying to Heroku)
app.set('port', port);

const server = http.createServer(app);

const DB_USER = "da_admin";
const DB_PW = "HelloDirtAlert123";
const DB_NAME = 'dirtalert';
const DB_STORY_COLLECTION = 'stories';
const DB_AWARD_COLLECTION = 'awards';
const DB_USER_COLLECTION = 'users';

const URI = "mongodb+srv://" + DB_USER + ":"+ DB_PW + "@dirtalert.z0it4.mongodb.net/test";

// Create the client
const client = new MongoClient(URI);

// Connect to the db
let database;
client.connect((error, db) => {
    if (error || !db) {
        console.log("Could not connect to MongoDB:")
        console.log(error.message);
    }
    else {
        database = db.db('dirtalert');
        console.log("Successfully connected to MongoDB.");
    }
})

//////////////////////////////////////
//// ENDPOINTS ///////////////////////
//////////////////////////////////////

app.get('/api', async (req, res) => {
    res.send("Welcome to the DirtAlert DB");
})

//--------------------------------------------------------------------------------------------------
// Story Endpoints
//--------------------------------------------------------------------------------------------------

// GET - /api/stories - get all stories
app.get('/api/stories', async (req, res) => {

    try {
        const collection = database.collection(DB_STORY_COLLECTION);

        const result = await collection.find().toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }

})

// GET - /api/stories/:id - get a story by id
app.get('/api/stories/:id', async (req, res) => {

    // read the path parameter :id
    let id = req.params.id;

    try {
        const stories = database.collection(DB_STORY_COLLECTION);
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await stories.findOne(query);

        if (!result) {
            let responseBody = {
                status: "No story with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }

})

// POST - /api/stories - create a new story
app.post('/api/stories', async (req, res) => {

    try {
        const stories = database.collection(DB_STORY_COLLECTION);

        var story = {
            title: req.body.title,
            user: req.body.user,
            date: (new Date()).toISOString(),
            image: null,
            awards: [],
        };

        const result = await stories.insertOne(story);

        res.status(201).send({ _id: result.insertedId });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

// PUT - /api/stories/:id - update an existing story by id
app.put('/api/stories/:id', async (req, res) => {

    // read the path parameter :id
    let id = req.params.id;
    let story = req.body;
    delete story._id; // delete the _id from the object, because the _id cannot be updated

    try {
        const collection = database.collection(DB_STORY_COLLECTION);
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await collection.updateOne(query, { $set: story });

        if (result.matchedCount === 0) {
            let responseBody = {
                status: "No story with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send({ status: "Story with id " + id + " has been updated." });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

// DELETE - /api/stories/:id - delete a story by id
app.delete('/api/stories/:id', async (req, res) => {
    let id = req.params.id;

    try {
        const story = database.collection(DB_STORY_COLLECTION);
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await story.deleteOne(query);

        if (result.deletedCount === 0) {
            let responseBody = {
                status: "No story with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            let responseBody = {
                status: "Story with id " + id + " has been successfully deleted."
            }
            res.send(responseBody);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// Award Endpoints
//--------------------------------------------------------------------------------------------------

// GET - /api/awards - get all awards
app.get('/api/awards', async (req, res) => {

    try {
        const collection = database.collection(DB_AWARD_COLLECTION);

        const result = await collection.find().toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }

})

// GET - /api/awards/:id - get an award by id
app.get('/api/awards/:id', async (req, res) => {
    let id = req.params.id;

    try {
        const awards = database.collection(DB_AWARD_COLLECTION);
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await awards.findOne(query);

        if (!result) {
            let responseBody = {
                status: "No award with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }

})

// PUT - /api/awards/:id - update an award by id
app.put('/api/awards/:id', async (req, res) => {
    let id = req.params.id;
    let award = req.body;
    delete award._id; // delete the _id from the object, because the _id cannot be updated

    try {
        const collection = database.collection(DB_AWARD_COLLECTION);
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await collection.updateOne(query, { $set: award });

        if (result.matchedCount === 0) {
            let responseBody = {
                status: "No award with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send({ status: "Award with id " + id + " has been updated." });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

//--------------------------------------------------------------------------------------------------
// User Endpoints
//--------------------------------------------------------------------------------------------------

// GET - /api/users - get all users
app.get('/api/users', async (req, res) => {

    try {
        const collection = database.collection(DB_USER_COLLECTION);
        const result = await collection.find().toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }

})

// GET - /api/users/:id - get a story by id
app.get('/api/users/:id', async (req, res) => {

    // read the path parameter :id
    let id = req.params.id;

    try {
        const users = database.collection(DB_USER_COLLECTION);
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await users.findOne(query);

        if (!result) {
            let responseBody = {
                status: "No user with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }

})

server.listen(port, () => console.log("app listening on port " + port));
