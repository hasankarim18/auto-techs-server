const express = require('express')
const jwt = require("jsonwebtoken");
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

/** 
 *  1. Authorization comes from bookings router because it is protected router 
 */

const verifyJWT = (req, res, next)=> {
  const authorization = req.headers.authorization
  if(!authorization){
    return res.status(401).send({error:true, message:'unauthorized access authorization not found'})
  }

  const token = authorization.split(' ')[1]

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded)=> {
    if(error){
      return res.status(401).send({error:true, message:'unauthorized access. Authorization expired'});
    }

    req.decoded = decoded;
    next()

  } )

}


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

     const database = client.db("autoTechsDb");
     const serviceCollection = database.collection("services");
     const bookingsCollection = database.collection("bookings");

    /*************************** jwt */
    app.post('/jwt', (req, res)=> {
      const user = req.body;
    
     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
       expiresIn: "2 days",
     });
     
     res.send({token})
    } )    


    /*************************** jwt */


    // services routes
    app.get("/services", async (req, res) => {

      const sort = req.query.sort 
      const search = req.query.search
    

      const query = {title: {$regex: search, $options:'i'}}

      //  comparison operator 
      // needs to indexed
   //   const query = {price: {$gt:50, $lte: 200}}

        const options = {
          // sort returned documents in ascending order by title (A->Z)
          sort: { price: sort === 'asc' ? 1: -1 },
          // Include only the `title` and `imdb` fields in each returned document
        
        };


      const services = await serviceCollection.find(query, options).toArray();
      res.send(services);
    });

    app.get('/services/:id', async (req, res)=> {
         const id = req.params.id
         const idS = id.toString();
         const query = { _id: new ObjectId(idS) };

        const options = {          
          projection: { _id: 1, title: 1, price:1, service_id:1},
        };

         const result = await serviceCollection.findOne(query);
         res.send(result)
    } )

    // getting some booking data

    app.get("/bookings", verifyJWT, async (req, res) => {
      const decoded = req.decoded
      console.log('come back after verification', decoded);
      if(decoded.email !== req.query.email ){
        return res.status(403).send({error:1, message:'forbidden access'})
      }
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    
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

    app.delete("/bookings/:id", async (req, res) => {     
      const id  = req.params.id;     
       const query = { _id: new ObjectId(id)  };
       const result = await bookingsCollection.deleteOne(query);
        res.send(result)
    });

    // pathc
    app.patch('/bookings/:id',  async (req, res)=> {
        const updatedBooking = req.body;
        const id = req.params.id
        const filter = { _id: new ObjectId(id) };
           const options = { upsert: true };
        console.log(id,updatedBooking.status);
         const updateDoc = {
           $set: {
             status: updatedBooking.status,
           },
         };

       const result = await bookingsCollection.updateOne(filter, updateDoc);
       res.send(result)
    } )




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
    res.send('Auto techs are comming to your country and city ')
} )

app.listen(port, ()=> {
    console.log('auto tech server is running');
} )

