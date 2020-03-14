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
app.delete("/api/students", (req, res, next) => {
  console.log(req.body)
  db.deleteStudent(req.body[0]).then(response => res.send(response))
})

//put
app.put("/api/students/:id", (req, res, next) => {
  db.updateStudent(req.params.id, null).then(response => res.send(response))
})

app.put("/api/schools", (req, res, next) => {
  db.updateStudent(req.body[0], req.body[1])
    .then(response => {
      console.log(response)
      res.send(response)
    })
    .catch(next)
})

db.sync()
  .then(() => {
    console.log("db synced")
    app.listen(port, () => console.log(`listening on port ${port}`))
  })
  .catch(ex => console.log(ex))
