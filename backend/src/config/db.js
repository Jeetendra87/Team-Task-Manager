const mongoose = require("mongoose");
const env = require("./env");

async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
  // eslint-disable-next-line no-console
  console.log("[db] connected to MongoDB");
}

module.exports = { connectDB };
