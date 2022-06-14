const express = require('express')
const app = express()
const port = process.env.PORT || 5000

//middleware
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const cors = require('cors')
require('dotenv').config()
app.use(cors())
app.use(express.json());



// userDB
// f9I7Gwgg8F0ELs0B

//mongoDB connection


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n6fcc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        console.log('mongodb with node curd')


        const userCollection = client.db("authenticationDB").collection("user-collection");

        app.post('/signup', async (req, res) => {
            const userData = req.body
            console.log(userData)


            const hashPassword = await bcrypt.hash(req.body.password, saltRounds)
            const doc = {
                email: req.body.email,
                phone: req.body.phoneNumber,
                password: hashPassword
            }
            const result = await userCollection.insertOne(doc)
            res.send(result)

        })

    } finally {
        //await client.close();
    }
}
run().catch(console.dir);



//server test
app.get('/', (req, res) => {
    res.send('authentication server')
})

app.listen(port, () => {
    console.log(`Server running  on port ${port}`)
})