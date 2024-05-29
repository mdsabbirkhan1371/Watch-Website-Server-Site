const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@watches.od6rwj4.mongodb.net/?retryWrites=true&w=majority&appName=Watches`;

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
    const watchCollection = client.db('Watches_DB').collection('Watches');
    const userCollection = client.db('Watches_DB').collection('Users');
    const orderCollection = client.db('Watches_DB').collection('Orders');

    // orders collection apis

    // get all order data
    app.get('/orders', async (req, res) => {
      const cursor = orderCollection.find();
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // post order to send db
    app.post('/watches/:id', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    // users collection api
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // watches section apis

    // get one product
    app.get('/watches/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const watch = await watchCollection.findOne(query);
      res.send(watch);
    });

    // get all product from db

    app.get('/watches', async (req, res) => {
      const cursor = watchCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // post data in db
    app.post('/watches', async (req, res) => {
      const watch = req.body;
      console.log(watch);
      const result = await watchCollection.insertOne(watch);
      res.send(result);
    });

    // update a product

    app.put('/watches/:id', async (req, res) => {
      const id = req.params.id;
      const updateWatch = req.body;
      console.log(updateWatch, id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateWatch.name,
          photo: updateWatch.photo,
          description: updateWatch.description,
          price: updateWatch.price,
          quantity: updateWatch.quantity,
          sellerName: updateWatch.sellerName,
          deliveryType: updateWatch.deliveryType,
        },
      };

      const watch = await watchCollection.updateOne(filter, updateDoc, options);
      res.send(watch);
    });

    // delete product

    app.delete('/watches/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await watchCollection.deleteOne(query);
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Watch Server Is Running');
});

app.listen(port, () => {
  console.log(`Watch Server is Listening in Port : ${port}`);
});
