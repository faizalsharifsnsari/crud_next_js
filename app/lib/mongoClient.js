import { MongoClient } from "mongodb";

const username = process.env.MONGODB_USERNAME;
const password = encodeURIComponent(process.env.MONGODB_PASSWORD);

if (!username || !password) {
  throw new Error("Missing MongoDB environment variables");
}

const uri = `mongodb+srv://${username}:${password}@cluster120.jr9imks.mongodb.net/products_db?retryWrites=true&w=majority&authSource=admin`;

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
