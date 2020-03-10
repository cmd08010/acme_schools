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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    schoolID UUID references school(id) NULL,
    date_create TIMESTAMP default CURRENT_TIMESTAMP
  );

  INSERT INTO school (name) VALUES ('UConn');
  INSERT INTO student (name, schoolID) VALUES ('Colleen Dunion', (select id from school where name = 'UConn'))

  `
  await client.query(SQL)
}

const createStudent = async (name, school) => {
  const SQL = `
  INSERT INTO student (name, schoolID) VALUES ($1, (select id from school where name = $2))
  returning *
  `
  const response = await client.query(SQL, [name, school])
  return response.rows
}
const createSchool = () => {}
const updateStudent = () => {}

const getStudents = async () => {
  const SQL = `
  SELECT * FROM student
  `
  const response = await client.query(SQL)
  return response.rows
}

const getSchools = async () => {
  const SQL = `
  SELECT * FROM school
  `
  const response = await client.query(SQL)
  return response.rows
}

module.exports = {
  sync,
  createSchool,
  createStudent,
  updateStudent,
  getStudents,
  getSchools
}
