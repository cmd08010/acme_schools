const express = require("express")
const app = express()
const router = express.Router()
const path = require("path")
const morgan = require("morgan")
const fs = require("fs")
const db = require("./db")
const bodyParser = require("body-parser")
const port = process.env.PORT || 3000

app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))
app.use(bodyParser.json())

app.use(express.static("assets"))

//get
app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname + "/index.html"))
})

app.get("/api/students", (req, res, next) => {
  db.getStudents().then(response => {
    db.getUnenrolledStudents().then(unenrolledResponse =>
      res.send([response, unenrolledResponse])
    )
  })
})

app.get("/api/schools", (req, res, next) => {
  db.getSchools().then(response => res.send(response))
})

//post
app.post("/api/students/:name", (req, res, next) => {
  db.createStudent(req.params.name, req.body[0]).then(response => {
    res.send(response)
  })
})
app.post("/api/schools/:name", (req, res, next) => {
  const name = req.params.name
  db.createSchool(name).then(response => res.send(response))
})

//delete
app.delete("/api/schools", (req, res, next) => {
  res.send("wow")
})

//put
app.put("/api/", (req, res, next) => {
  res.send("wow")
})

db.sync()
  .then(() => {
    console.log("db synced")
    app.listen(port, () => console.log(`listening on port ${port}`))
  })
  .catch(ex => console.log(ex))
