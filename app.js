var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var dotenv = require("dotenv");
var cors = require("cors");
var methodOverride = require("method-override");
var sanitizer = require("express-sanitizer");

var app = express();
dotenv.config({ path: './config.env' });

mongoose.connect(process.env.DBURL, { useNewUrlParser: true }, (error) => {
    if (error) {
        console.log(error);
        console.log("failed to connect to DB");
    } else {
        console.log("connected to DB");
    }
});

var corsOptions = {
    origin: 'http://example.com',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(sanitizer());
app.set("view engine", "ejs");

//MONGOOSE model config
var postSchema = mongoose.Schema({
    title:String,
    image:String,
    body:String,
    date:{type:Date, default: Date.now},
});
var postModel = mongoose.model("Post", postSchema);

//RESTFUL ROUTES

app.get("/", (req, res) => {
    res.redirect("/blog");
});

//INDEX route
app.get("/blog", (req, res) => {
    postModel.find({}, (error, posts) => {
        if (error) {
            console.log(error);
        } else {
            res.render("index", {posts: posts});
        }
    });
});

//NEW route
app.get("/blog/new", (req, res) => {
    res.render("new");
});

//CREATE route
app.post("/blog", (req, res) => {

    // sanitize to remove scripts
    req.body.post.body = req.sanitize(req.body.post.body);

    postModel.create(req.body.post, (error, newPost) => {
        if (error) {
            res.render("new");
        } else {
            res.redirect("/blog");
        }
    });
});

//SHOW route
app.get("/blog/:id", (req, res) => {
    postModel.findById(req.params.id, (error, found) => {
        if (error) {
            res.redirect("/blog");
        } else {
            res.render("show", {post: found});
        }
    });
});

//EDIT route
app.get("/blog/:id/edit", (req, res) => {
    postModel.findById(req.params.id, (error, found) => {
        if (error) {
            res.redirect("/blog/" + req.params.id);
        } else {
            res.render("edit", {post: found});
        }
    });
});

//UPDATE route
app.put("/blog/:id", (req, res) => {

    // sanitize to remove scripts
    req.body.post.body = req.sanitize(req.body.post.body);

    postModel.findByIdAndUpdate(req.params.id, req.body.post, (error, found) => {
        if (error) {
            console.log(error);
            console.log("failed to update post");
            res.redirect("/blog/" + req.params.id + "/edit");
        } else {
            res.redirect("/blog/" + req.params.id);
        }
    });
});

//DELETE route
app.delete("/blog/:id", (req, res) => {
    postModel.findOneAndRemove(req.params.id, (error) => {
        if (error) {
            console.log(error);
            res.redirect("/blog/" + req.params.id);
        } else {
            res.redirect("/blog");
        }
    });
});

app.listen(process.env.PORT, (error) => {
    if (error) {
        console.log(error);
        console.log("failed to start server");
    } else {
        console.log("Server started on " + process.env.PORT);
    }
});