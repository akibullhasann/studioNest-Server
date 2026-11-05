import express from 'express'
import { MongoClient, ObjectId } from "mongodb";
import 'dotenv/config';
import cors from "cors";


const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());




const client = new MongoClient(process.env.MONGODB_URI);




const verifyToken = async (req, res, next) => {
    const authHeaders = req.headers.authorization;
    
    if(!authHeaders){
        return res.status(401).send({msg: 'Unauthorised'})
    }

    const token = authHeaders.split(" ")[1];
    console.log(token)
    
    if(!token){
        return res.status(401).send({msg: 'Unauthorised'})
    }

    const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`) )

    try{
        const {payload} = await jwtVerify(token, JWKS);
    console.log(payload)
   
    next()
    }catch(error){
        return res.status(500).send({msg: 'something wrong'})
    }

}



export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoClient = await connectToMongoDB();
const db = mongoClient.db("studioNest");
const studioCollection = db.collection("studioSpace");
const bookingCollection = db.collection("bookings");

// for adding details to the database for the studio at localhost:5000/add-studio
 
app.post('/add-studio', async (req, res) => {
  try {
    const data = req.body;
    const result = await studioCollection.insertOne(data);
    console.log('from server me', result);

    res.send(result);

  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Something went wrong' });
  }
});

// for getting details from the database for the studio at localhost:5000/studio-details

app.get("/studio-details", async (req, res)=>{
    const result = await studioCollection.find({}).toArray();
    res.send(result);
});
app.get("/studio-details/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const result = await studioCollection
      .find({ "host.email": email })
      .toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});

// fetured studio api for home page
app.get("/featured-studio", async (req, res) => {
  const result = await studioCollection.find({}).limit(5).toArray();
  res.send(result);
});



// Api for getting data of single detail
app.get("/studio/:id", verifyToken ,async(req, res) =>{
  const {id} = req.params;
  const result = await studioCollection.findOne({_id: new ObjectId(id)})

  res.send(result)
})

// delete a studio listing (used by the My Listings page)
app.delete("/delete-studio/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await studioCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Something went wrong" });
  }
});

// update a studio listing (used by the My Listings page)
app.put("/update-studio/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await studioCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Something went wrong" });
  }
});

// making database for bookings Details
app.post("/bookings-list", async(req, res)=>{
    const data = req.body;
    const result = await bookingCollection.insertOne(data);
    res.send(result);

})
app.get("/my-bookings/:email", async (req, res) => {
    const { email } = req.params
    const result = await bookingCollection.find({
        email: email
    }).toArray();
    res.send(result)

})

app.patch("/my-bookings/:id", async (req, res) => {

    const { id } = req.params
    const result = await bookingCollection.updateOne(
      {_id: new ObjectId(id)},
      {
        $set: {
          status: "cancelled",
        },
      }
    )
    res.send(result)
})
 
app.get('/', (req,res)=>{
    res.send({message: 'server is running proper'})
})

app.listen(PORT, ()=>{
    console.log('server is running at', PORT)
})

export default app;