const express = require("express")
const app = express()

app.engine("handlebars", require("express-handlebars").engine({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(express.static("public"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

const db = require("pg-promise")({})({
    connectionString: "postgresql://postgres:nimda@localhost:5432/jwttest",
    ssl: {
        rejectUnauthorized: process.env.NODE_ENV !== "production"
    }
})

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/", (req, res) => {
    res.redirect("back")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/login", (req, res) => {
    res.redirect("back")
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.post("/register", (req, res) => {
    res.redirect("back")
})

module.exports = app

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 App running at PORT: ${PORT}`))