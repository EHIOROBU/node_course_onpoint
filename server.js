const express = require("express");
const morgan = require("morgan");
const { engine } = require("express/lib/application");
const mongoose = require("mongoose");
//exporting model to mongoose.............
const Blog = require("./models/blog");
//express app
const app = express();
//connecting to mongoDB
const dburi =
  "mongodb+srv://dracs:Dracula@dracula.9txqovl.mongodb.net/draculate?retryWrites=true&w=majority&appName=Dracula";
mongoose
  .connect(dburi)
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

//register view engine
app.set("view engine", "ejs");

//middleware & static files
app.use(express.static("public"));
//accepting data with extended middleware........
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

//mongoose and mong sandbox routers.........
app.get("/add-blog", (req, res) => {
  const blog = new Blog({
    title: "new blog ",
    snippet: "about my new blog",
    body: "more about my new blog",
  });
  blog
    .save()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  console.log("new request made:");
  console.log("host: ", req.hostname);
  console.log("path: ", req.path);
  console.log("method: ", req.method);
  next();
});
app.use((req, res, next) => {
  console.log("in the next middleware");
  next();
});
//using morgan
app.use(morgan("dev"));

app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});
// passing datas on view engine ejs express

app.get("/", (req, res) => {
  res.redirect("/blogs");
});
app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

// router
app.get("/blogs", (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("index", { title: "All Blogs", blogs: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

//post request
app.post("/create-blog", (req, res) => {
  const blog = new Blog(req.body);
  blog
    .save()
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
});
//getting request by ID
app.get("/blogs/:id", (req, res) => {
  const id = req.params.id;
  Blog.findById(id)
    .then((result) => {
      res.render("details", { blog: result, title: "Blog Details" });
    })
    .catch((err) => {
      console.log(err);
    });
});
//delete blogs
app.delete("/blogs/:id", (req, res) => {
  const id = req.params.id;
  Blog.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: "/blogs" });
    })
    .catch((err) => {
      console.log(err);
    });
});
//new blog nav.......
app.get("/create-blog", (req, res) => {
  res.render("create", { title: "Create a new blog" });
});

//404
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
