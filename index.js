const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
     const serviceCollection = database.collection("services");
     const bookingsCollection = database.collection("bookings");

    app.get("/services", async (req, res) => {
      const services = await serviceCollection.find().toArray();
      res.send(services);
    });

    app.get('/services/:id', async (req, res)=> {
         const id = req.params.id
         const idS = id.toString();
         const query = { _id: new ObjectId(idS) };

        const options = {
          // sort matched documents in descending order by rating          
          // Include only the `title` and `imdb` fields in the returned document
          projection: { _id: 1, title: 1, price:1, service_id:1},
        };

         const result = await serviceCollection.findOne(query);
         res.send(result)
    } )

    // bookings 
    app.post("/bookings", async (req, res) => {
      const bookings = req.body;
     // console.log(bookings);
      const doc = {
        title: "Record of a Shriveled Datum",
        content: "No bytes, no problem. Just insert a document, in MongoDB",
      };
      const result = await bookingsCollection.insertOne(bookings);
      res.send(result)
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

