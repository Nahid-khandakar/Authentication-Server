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


        //signup control
        app.post('/signup', async (req, res) => {
            const userData = req.body
            // console.log(userData)
            const query = { email: req.body.email }
            const user = await userCollection.findOne(query)
            console.log('from sign up', user)
            console.log('email', user?.email, typeof user?.email)
            console.log('req body email', req.body.email, typeof req.body.email)

            if (req.body.email !== user?.email) {

                const hashPassword = await bcrypt.hash(req.body.password, saltRounds)
                const doc = {
                    email: req.body.email,
                    phone: req.body.phoneNumber,
                    password: hashPassword
                }
                const result = await userCollection.insertOne(doc)
                res.send(result)
                console.log('new user created')

            }
            else {
                console.log('user exist')
                res.send('user already exist')
            }

        })


        //login control
        app.post('/login', async (req, res) => {

            try {
                const userData = req.body
                //console.log('post login', userData)

                const query = { email: req.body.email }
                const user = await userCollection.findOne(query)
                //console.log("come form login", user)

                if (user) {
                    const cmp = await bcrypt.compare(req.body.password, user.password)

                    if (cmp) {
                        //console.log('good')
                        res.status(200)
                    }
                    else {
                        //console.log('bad')
                        res.send('wrong password')
                    }
                } else {
                    res.send('wrong username or password')
                }

            }
            catch (error) {
                console.log(error)
            }

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