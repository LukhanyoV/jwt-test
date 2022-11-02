require("dotenv").config()
const secret = process.env.JWT_SECRET

const express = require("express")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const moment = require("moment")
const app = express()

app.engine("handlebars", require("express-handlebars").engine({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(express.static("public"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())
app.use(require("express-session")({
    secret: "ef0q374tep94gaf4hel887fahuedhfo7a3lifuagliua3lu",
    resave: false,
    saveUninitialized: true
}))
app.use((req, res, next) => {
    const auth = ["/login", "/register"]
    const token = req.cookies.token
    try {
        const verify = token && jwt.verify(token, secret)
        if(verify){
            req.user = verify
            if(auth.includes(req.path)){
                return res.redirect("/")
            } else {
                return next()
            }
        } else {
            if(auth.includes(req.path)){
                return next()
            } else {
                return res.redirect("/login")
            }
        }
    } catch (error) {
        res.clearCookie("token")
        return res.redirect("/login")
    }
})

const db = require("pg-promise")({})({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:nimda@localhost:5432/jwttest",
    ssl: {
        rejectUnauthorized: process.env.NODE_ENV === "production" && false
    }
})

app.get("/", async (req, res) => {
    const {username} = req.user
    const data = await db.manyOrNone("SELECT username, item, created FROM todolist JOIN users ON users.id = todolist.author")
    res.render("index", {
        username: username,
        data: data.map(item => {
            return {...item, mine: item.username === username, created: moment(item.created).fromNow()}
        }),
        helpers: {
            side: bool => {
                return bool ? "out" : "in"
            }
        }
    })
})

app.post("/", async (req, res) => {
    const {id} = req.user
    const {item} = req.body
    if(item){
        await db.none("INSERT INTO todolist (item, author) VALUES ($1, $2)", [item, id])
    }
    res.redirect("back")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/login", async (req, res) => {
    let {username, password} = req.body
    username = username.toLowerCase().trim()
    password = password.trim()
    if(username && password){
        let check = await db.oneOrNone("SELECT id, username FROM users WHERE username = $1 AND password = $2", [username, password])
        if(check){
            const token = jwt.sign(check, secret, {
                expiresIn: '1h'
            })
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production"
            })
        }
    }
    res.redirect("back")
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.post("/register", async (req, res) => {
    let {username, password} = req.body
    username = username.toLowerCase().trim()
    password = password.trim()
    if(username && password){
        let check = await db.one("SELECT COUNT(*) FROM users WHERE username = $1", [username])
        if(check.count-"" === 0){
            await db.none("INSERT INTO users (username, password) VALUES ($1, $2)", [username, password])
        }
    }
    res.redirect("back")
})

app.get("/logout", async (req, res) => {
    res.clearCookie("token")
    res.redirect("/login")
})

module.exports = app

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 App running at PORT: ${PORT}`))