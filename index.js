require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
        const commentCollection = client.db("Ripple").collection("comments");
        const tagCollection = client.db("Ripple").collection("tags");
        const announcementCollection = client.db("Ripple").collection("announcement");



        // user related api

        app.get("/users", async (req, res) => {
            const search = req.query.search || "";
            const regexValue = String(search);
            let query = {
                name: {
                    $regex: regexValue,
                    $options: 'i'
                }
            };
            const cursor = userCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })


        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const result = await userCollection.findOne(query);
            res.send(result);
        })

        app.post("/users", async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        })

        app.patch("/users/:email", async (req, res) => {
            const newBadge = req.body;
            const email = req.params.email;
            const filter = {email: email};
            const updateDoc = {
                $set: {
                    role: newBadge.role
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.patch("/users/makeadmin/:id", async (req, res) => {
            const newRole = req.body;
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const updateDoc = {
                $set: {
                    role: newRole.role
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // posts related api

        app.post("/posts", async (req, res) => {
            const post = req.body;
            const result = await postCollection.insertOne(post);
            res.send(result);
        })

        app.get("/allposts", async (req, res) => {
            const cursor = postCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/posts", async (req, res) => {
            const search = req.query.search;
            const sortBy = req.query.sortBy;
            const regexValue = String(search);
            const result = await postCollection.aggregate([
                {
                    $addFields: {
                        voteDifference: { $subtract: ["$upvote", "$downvote"] }
                    }
                },
                {
                    $match: {
                        tag: {
                            $regex: regexValue,
                            $options: 'i'
                        }
                    }
                },
                {
                    $sort: sortBy === 'popularity' ? { voteDifference: -1 } : { time: -1 }
                },
                {
                    $limit: 5
                }
            ]).toArray();
            res.send(result);
        })

        app.get("/post/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await postCollection.findOne(query);
            res.send(result);
        })

        app.get("/post/email/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = postCollection.find(query).limit(3);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/posts/email/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = postCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.patch("/upvote/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $inc: {
                    upvote: 1
                }
            }
            const result = await postCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.patch("/downvote/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $inc: {
                    downvote: 1
                }
            }
            const result = await postCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // comment related api

        app.get("/comments", async (req, res) => {
            const cursor = commentCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/comments/:postId", async (req, res) => {
            const postId = req.params.postId;
            const query = {postId: postId};
            const result = await commentCollection.find(query).toArray();
            res.send(result);
        })

        app.post("/comments", async (req, res) => {
            const comment = req.body;
            const result = await commentCollection.insertOne(comment);
            res.send(result);
        })

        // tag related api
        app.get("/tags", async (req, res) => {
            const cursor = tagCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post("/tags", async (req, res) => {
            const newTag = req.body;
            const result = await tagCollection.insertOne(newTag);
            res.send(result);
        })

        //announcement related api
        app.post("/announcements", async (req, res) => {
            const newAnnouncement = req.body;
            const result = await announcementCollection.insertOne(newAnnouncement);
            res.send(result);
        })

        app.get("/announcements", async (req, res) => {
            const cursor = announcementCollection.find();
            const result = await cursor.toArray();
            res.send(result);
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