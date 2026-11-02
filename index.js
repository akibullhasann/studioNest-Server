import express from 'express'
import { MongoClient, ObjectId } from "mongodb";
import 'dotenv/config';
import cors from "cors";


const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());




const client = new MongoClient(process.env.MONGODB_URI);

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

app.get("/studio/:id", async(req, res) =>{
  const {id} = req.params;
  const result = await studioCollection.findOne({_id: new ObjectId(id)})

  res.send(result)
})

 
app.get('/', (req,res)=>{
    res.send({message: 'server is running proper'})
})

app.listen(PORT, ()=>{
    console.log('server is running at', PORT)
})