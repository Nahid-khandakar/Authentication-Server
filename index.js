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


//mongoDB connection


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n6fcc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();

        const userCollection = client.db("authenticationDB").collection("user-collection");
        const userInformation = client.db("authenticationDB").collection("user-information");


        //signup control
        app.post('/signup', async (req, res) => {


            const userData = req.body
            const inputEmail = req.body.email
            const query = { email: req.body.email }
            const user = await userCollection.findOne(query)


            if (user == null) {

                const hashPassword = await bcrypt.hash(req.body.password, saltRounds)
                const doc = {
                    email: req.body.email,
                    phone: req.body.phoneNumber,
                    password: hashPassword
                }
                const result = await userCollection.insertOne(doc)
                res.status(200).json({ 'success': true, 'result': result })


            }
            else {

                res.status(409).send('user already exist')

            }


        })


        //login control
        app.post('/login', async (req, res) => {

            try {
                const userData = req.body


                const query = { email: req.body.email }
                const user = await userCollection.findOne(query)

                if (user) {
                    const cmp = await bcrypt.compare(req.body.password, user.password)

                    if (cmp) {

                        res.status(200).json({ 'success': true })
                    }
                    else {

                        res.status(403).send('wrong password')
                    }
                } else {
                    res.status(403).send('wrong username or password')
                }

            }
            catch (error) {
                console.log(error)
            }

        })

        //post user information
        app.post('/create', async (req, res) => {
            const userInfo = req.body

            const doc = {
                name: req.body.name,
                address: req.body.address,
                birthDate: req.body.birth,
                state: req.body.state,
                age: req.body.age,
                pin: req.body.pin
            }
            const result = await userInformation.insertOne(doc)

            res.send(result)
        })


        //find all user information
        app.get('/userinfo', async (req, res) => {
            const query = {}
            const cursor = userInformation.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        //delete a user data
        app.delete('/userinfo/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await userInformation.deleteOne(query)
            res.send(result)
        })

        //update a user data
        app.put('/userinfo/:id', async (req, res) => {
            const id = req.params.id
            const userinfo = req.body
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: userinfo.name,
                    address: userinfo.address,
                    birthDate: userinfo.birth,
                    state: userinfo.state,
                    age: userinfo.age,
                    pin: userinfo.pin
                },
            };
            const result = await userInformation.updateOne(filter, updateDoc, options)
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