const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000

const app = express()



const userName = process.env.USER_NAME;
const pass = process.env.PASSWORD



// middlewares 
app.use(cors())
app.use(express.json()) 


const uri = `mongodb+srv://${userName}:${pass}@cluster0.nzfxe6e.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

     const database = client.db("autoTechsDb");
     const autoTechsCollections = database.collection("services");

    app.get("/services", async (req, res) => {
      const services = await autoTechsCollections.find().toArray();
      res.send(services);
    });


    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=> {
    res.send('Auto techs are comming to your city')
} )

app.listen(port, ()=> {
    console.log('auto tech server is running');
} )

