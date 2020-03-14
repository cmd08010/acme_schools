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
    schoolid UUID references school(id) NULL,
    date_create TIMESTAMP default CURRENT_TIMESTAMP
  );

  INSERT INTO school (name) VALUES ('UConn');
  INSERT INTO student (name, schoolid) VALUES ('Colleen Dunion', (select id from school where name = 'UConn'));
  INSERT INTO student (name) VALUES ('Charles St. Charles');

  `
  await client.query(SQL)
}

//get
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

const getUnenrolledStudents = async () => {
  const SQL = `
  SELECT * FROM student WHERE schoolid IS NULL`
  const response = await client.query(SQL)
  return response.rows
}

//Create
const createStudent = async (name, school) => {
  const SQL = `
  INSERT INTO student (name, schoolid) VALUES ($1, (SELECT id FROM school WHERE name = $2))
  returning *
  `
  console.log(school, name, "test")
  const response = await client.query(SQL, [name, school])
  console.log(response.rows, "db respose")

  return response.rows[0]
}

const createSchool = async name => {
  const SQL = `
  INSERT INTO school (name) VALUES ($1)
  returning *
  `
  const response = await client.query(SQL, [name])
  return response.rows[0]
}

//update
const updateStudent = async (id, school) => {
  const SQL = `UPDATE student SET schoolid = $2 WHERE id = $1
  returning *`
  const response = await client.query(SQL, [id, school])
  console.log(response.rows)
  return response.rows[0]
}

//delete

const deleteStudent = async id => {
  const SQL = `DELETE FROM student WHERE id = $1 `
  const response = await client.query(SQL, [id])
  return response.rows[0]
}
const deleteSchool = async id => {
  const SQL = `DELETE FROM student WHERE id = $1
  returning * `
  const response = await client.query(SQL, [id])
  return response.rows[0]
}

module.exports = {
  sync,
  createSchool,
  createStudent,
  updateStudent,
  getStudents,
  getUnenrolledStudents,
  getSchools,
  deleteStudent,
  deleteSchool
}
