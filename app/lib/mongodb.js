const username = process.env.MONGODB_USERNAME;
const password = encodeURIComponent(process.env.MONGODB_PASSWORD);

if (!username || !password) {
  throw new Error("Missing MongoDB environment variables");
}

console.log(
  "ENV USER:", process.env.MONGODB_USERNAME,
  "ENV PASS:", process.env.MONGODB_PASSWORD
);


export const connectionStr = `mongodb+srv://${username}:${password}@cluster0.jr9imks.mongodb.net/products_db?retryWrites=true&w=majority&authSource=admin`;
