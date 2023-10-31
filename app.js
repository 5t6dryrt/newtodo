//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect('mongodb+srv://5t6dryrt:tonnamza@cluster0.vyut5co.mongodb.net/todolistDB');


const itemSchema = new mongoose.Schema({
  name:String
})

const Item = mongoose.model("Item",itemSchema)

const Item1 = new Item({
  name:"WELCOME TO TODOLIST"
})

const Item2 = new Item({
  name:"hit the + button to add new stuff"
})

const Item3 = new Item({
  name:"<-- hit this to delete an item"
})

const defaultItems = [Item1, Item2, Item3]

const listSchema =  new mongoose.Schema({
  name:String,
  items:[itemSchema]
})

const List = mongoose.model('List',listSchema)

// Item.insertMany(defaultItems).then((result) =>{
//   console.log('succes add')
// }).catch((err) =>{
//   console.error.log(err)
// })
// Item.insertMany(defaultItems)

app.get("/", async function(req, res) {



  await Item.find({}).then((founditems)=>{
    if(founditems.length ==0){
      Item.insertMany(defaultItems)
      res.redirect('/')
    }else{
      res.render("list", {listTitle: "today", newListItems: founditems});
    }
  
    
  }).catch((err)=>{
    console.log(err)
  })

const day = date.getDate();

  

});

app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(itemName)
  console.log(listName)
  const item  = new Item({
    name: itemName
  })
  if( listName === "today" ){
    item.save();
    res.redirect("/")  
  } else{
    List.findOne({name:listName}).then((foundList)=>{
      console.log(foundList)
      if(!foundList){
        console.log('nolist')
      }else{
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName)
        
      }
    
    }).catch((err)=>{
      console.log("Error")
    })
  }

  
  
    
 
    
});

app.post('/delete', async (req,res)=>{
  const checkid = req.body.checkbox
  const listname = req.body.listName

  if(listname === "today"){
    Item.findByIdAndDelete(deletename).then((result)=>{
      console.log(result)
      res.rediret('/')
    }).catch((err)=>{
      console.log(err)
    })
  }else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkid}}}).then(()=>{
       res.redirect('/'+listname)
    })
    .catch((err)=>{
      console.log(err)
    })
  }



  
})


app.get("/:customListName", async   (req, res)=>{
  const customListName = _.capitalize(req.params.customListName) 

   List.findOne({name:customListName}).then((foundList)=>{
    if(!foundList){
      const list = new List({
        name:customListName,
        items:defaultItems
      })
      list.save()
      res.redirect('/'+customListName)
    }else{
      console.log(foundList)
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
   }).catch((err)=>{
    console.log(err)})

  

 
})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
