const express = require('express')
const MongoClient = require('mongodb').MongoClient
const app = express()
const port = 3000

app.get('/', (req, res) => {
    MongoClient.connect('mongodb://localhost:27017/test', {connectTimeoutMS: 5000}, function (err, db) {
        if (err) {
            console.log("Health Check - Mongo is down");
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
});

app.listen(port, () => {
    console.log(`Node server is listening on port ${port}`)
})