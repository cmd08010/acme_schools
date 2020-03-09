const pg = require("pg")
const { Client } = pg
const uuid = require("uuid/v4")
const client = new Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_schools"
)

client.connect()

const sync = async () => {
  const SQL = `

  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  DROP TABLE IF EXISTS student;
  DROP TABLE IF EXISTS school;

  CREATE TABLE school
  (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    date_create TIMESTAMP default CURRENT_TIMESTAMP
  );

  CREATE TABLE student
  (
    id INT PRIMARY KEY,
    name VARCHAR NOT NULL,
    schoolID UUID references school(id),
    date_create TIMESTAMP default CURRENT_TIMESTAMP
  );



  `
  await client.query(SQL)
}

module.exports = {
  sync
}
