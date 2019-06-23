const keys = require("./keys");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.NODE_ENV || 5000;

app.use(cors());
app.use(bodyParser.json());

// postgres client setup
const { Pool } = require("pg");

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  port: keys.pgPort,
  database: keys.pgDatabase,
  password: keys.pgPassword
});

pgClient.on("error", () => console.error("Lost PG connection"));

pgClient
  .query("CREATE TABLE IF NOT EXISTS values (number INT)")
  .catch(error => console.error(error));

// redis client setup
const redis = require("redis");
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

// express routes
app.get("/", (req, res) => res.send("hello api"));

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * from values");

  res.send(values.rows);
});

app.get("/values/current", (req, res) => {
  redisClient.hgetall("values", (err, values) => res.send(values));
});

app.post("/values", (req, res) => {
  const index = parseInt(req.body.index);
  if (index > 40) res.status(422).send("index too hight");

  redisClient.hset("values", index, "not a thing yet");
  redisPublisher.publish("insert", index);
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({ working: true });
});

app.listen(PORT, () => console.log(`listening to port: ${PORT}`));
