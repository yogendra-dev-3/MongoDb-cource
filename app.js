const express = require("express");
const { connectToDb, getDB } = require("./db");
const { ObjectId } = require("mongodb");

// init app & middleware

const app = express();
app.use(express.json())

// db connection

let db;
connectToDb((err) => {
  if (!err) {
    app.listen(5000, () => {
      console.log("app is listening on port 5000");
    });
    db = getDB();
  }
});

// routes

// fetch all books
app.get("/books", (req, res) => {
  const books = [];
  db.collection("books")
    .find()
    .sort({ pages: 1 })
    .forEach((book) => books.push(book))
    .then(() => {
      res.status(200).json(books);
    })
    .catch(() => {
      res.status(500).json({ error: "Could not fetch documents" });
    });
});

// pagination

// app.get("/books",(req,res)=>{
//   const page=req.query.p || 0
//   const booksPerPage=3

//   const books=[]
//   db.collection("books")
//     .find()
//     .sort({rating:1})
//     .skip(page*booksPerPage)
//     .limit(booksPerPage)
//     .forEach((book)=>books.push(book))
//     .then(()=>{
//       res.status(200).json(books)
//     })
//     .catch(err=>{
//       res.status(500).json({error: "Could not fetch books"})
//     })
// })

// fetch book by specific id

app.get("/books/:id", (req, res) => {
  const bookId = req.params.id;

  if (ObjectId.isValid(bookId)) {
    db.collection("books")
      .findOne({ _id: new ObjectId(bookId) })
      .then((doc) => {
        if (doc) {
          res.status(200).json(doc);
        } else {
          res
            .status(500)
            .json({ error: "no document is found with current id" });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Could not fetch document" });
      });
  } else {
    res.status(500).json({ error: "Not a valid Doc id" });
  }
});

// add new book
app.post("/books",(req,res)=>{
  const book=req.body;

  db.collection("books")
  .insertOne(book)
  .then(result=>{
    res.status(201).json(result)
  })
  .catch(err=>{
    res.status(500).json({error:"Could not create a new document"})
  })
})


//delete book based on id
app.delete("/books/:id",(req,res)=>{
  const bookId=req.params.id

  if(ObjectId.isValid(bookId)){
    db.collection("books")
      .deleteOne({_id:new ObjectId(bookId)})
      .then(result=>{
        res.status(200).json(result)
      })
      .catch(err=>{
        res.status(500).json({error:"Could not delete book"})
      })
  }
  else{
    res.status(500).json({error:"Not a valid Doc id"})
  }
})

// patch request - update specif properties
app.patch("/books/:id",(req,res)=>{
  const bookId=req.params.id
  const updates=req.body

  if(ObjectId.isValid(bookId)){
    db.collection("books")
    .updateOne({_id:new ObjectId(bookId)},{$set:updates})
    .then(result=>{
      res.status(200).json(result)
    })
    .catch(err=>{
      res.status(500).json({error:"Could not update properties"})
    })
  }
  else{
    res.status(500).json({error:"Not a valid doc id"})
  }
})