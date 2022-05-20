// Imports
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // See https://www.mongodb.com/docs/drivers/node/current/quick-start/
const cors = require('cors')
const http = require('http');
const bodyParser = require('body-parser');

// Set up App
const app = express();
app.use(cors()); // Allow all cross-origing requests. More information: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(express.static('public')); // Host all static files in the folder /public
app.use(bodyParser.json()); // Support json encoded bodies
const port = process.env.PORT || '3001'; // Use the PORT variable if set (e.g., when deploying to Heroku)
app.set('port', port);

const server = http.createServer(app);

// MongoDB connection URI

const DB_USER = "da_admin";

const DB_PW = "HelloDirtAlert123";

const DB_NAME = 'dirtalert';

const DB_STORY_COLLECTION = 'stories';

const URI = "mongodb+srv://" + DB_USER + ":"+ DB_PW + "@dirtalert.z0it4.mongodb.net/test";


// Create the client
const client = new MongoClient(URI);

//////////////////////////////////////
//// ENDPOINTS ///////////////////////
//////////////////////////////////////

app.get('/api', async (req, res) => {
    res.send("Welcome to the DirtAlert DB");
})

// GET /api/messages
// Variant A: Without query params
app.get('/api/stories', async (req, res) => {
    try {
        await client.connect();

        const database = client.db(DB_NAME);
        const messages = database.collection(DB_STORY_COLLECTION);

        // Get all messages
        const result = await messages.find().toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    } finally {
        await client.close();
    }
})

// GET /api/messages
// Variant B: With query params
app.get('/api/messages', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('messageboard');
        const messages = database.collection('messages');

        // You can specify a query/filter here, e.g., { sender: "Max"};
        // See https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/query-document/
        const query = {};
        if (req.query.sender) {
            query.sender = req.query.sender;
        }

        // Get all messages that match the query
        const result = await messages.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    } finally {
        await client.close();
    }
})


// GET /api/messages/:id
app.get('/api/messages/:id', async (req, res) => {

    // read the path parameter :id
    let id = req.params.id;

    try {
        await client.connect();
        const database = client.db('messageboard');
        const messages = database.collection('messages');
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await messages.findOne(query);

        if (!result) {
            let responseBody = {
                status: "No message with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            res.send(result);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    } finally {
        await client.close();
    }

})

// POST /api/messages
app.post('/api/stories', async (req, res) => {

    try {
        await client.connect();
        const database = client.db(DB_NAME);
        const stories = database.collection(DB_STORY_COLLECTION);

        var story = {
            title: req.body.title,
            date: (new Date()).toISOString(),
            image: null,
            awards: [],
        };

        const result = await stories.insertOne(story);

        res.status(201).send({ _id: result.insertedId });
    } catch (error) {
        res.status(500).send({ error: error.message });
    } finally {
        await client.close();
    }
})

// DELETE /api/messages
app.delete('/api/messages/:id', async (req, res) => {
    let id = req.params.id;

    try {
        await client.connect();
        const database = client.db('messageboard');
        const messages = database.collection('messages');
        const query = { _id: ObjectId(id) }; // filter by id
        const result = await messages.deleteOne(query);

        if (result.deletedCount === 0) {
            let responseBody = {
                status: "No message with id " + id
            }
            res.status(404).send(responseBody);
        }
        else {
            let responseBody = {
                status: "Message with id " + id + " has been successfully deleted."
            }
            res.send(responseBody);
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    } finally {
        await client.close();
    }
})

server.listen(port, () => console.log("app listening on port " + port));
