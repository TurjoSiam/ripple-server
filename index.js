require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.k0g53.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const userCollection = client.db("Ripple").collection("users");
        const postCollection = client.db("Ripple").collection("posts");



        // user related api

        app.get("/users", async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post("/users", async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        })

        // posts related api

        app.get("/posts", async(req, res) => {
            const search = req.query.search;
            const regexValue = String(search);
            let query = {
                tag: {
                    $regex: regexValue,
                    $options: 'i'
                }
            };
            const cursor = postCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })


    } finally {
    }
}
run().catch(console.dir);








app.get("/", (req, res) => {
    res.send("server is running")
});

app.listen(port, () => {
    console.log(`server is running in ${port}`);
})