//jshint esversion:6

const express = require("express");
const app = express();
const bodyParser=require("body-parser");
const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb+srv://admin-resumecrafto:Mongo707197@cluster0.od1tw.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = {
  name : {
    type : String,
    required : true
  }
};

const Item = mongoose.model("Item",itemSchema);

const firstSample = new Item({
  name: "Sample note"
});


const listSchema = {
  name : String,
  items : [itemSchema]
};

const List = mongoose.model("List", listSchema);

let entryData = [firstSample];

let workItems=[];


app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.get("/", function(req , res){
  Item.find({},function(err,foundList){
    console.log(foundList.length);
    if(foundList.length === 0){
      Item.insertMany(entryData,function(err){
        if(err)
        console.log(err+ " Error occurred");
        else{
          console.log("successfully inserted");
        }
      });
      res.redirect("/");
    }else{
      res.render("list",{listTitle: "Home", newEntry: foundList});
    }
  });
});

app.get("/:dynamicRoute", function(req, res){
  const customeListName = _.capitalize(req.params.dynamicRoute);
  List.findOne({name : customeListName}, function(err, results){
    if(err){
      console.log("Error occurs while finding the route name");
    }else{
      if(results){
        res.render("list",{listTitle: results.name, newEntry: results.items});
      }
      else{
        const list = new List({
          name : customeListName,
          items : entryData
        });
        list.save();
        res.redirect("/"+customeListName);
      }
    }
  });
});

app.post("/",function(req, res){
  const routeTitle = req.body.list;
  const itemName = req.body.entry;
  const task = new Item({
    name : itemName
  });
  console.log(routeTitle);
  if(routeTitle !== "Home")
  {
    List.findOne({name : routeTitle},function(err,results){
      results.items.push(task);
      results.save();
      res.redirect("/"+routeTitle);
    });
  }else{
    task.save();
    res.redirect("/");
  }
});

app.post("/delete",function(req, res){
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Home"){
    Item.deleteOne({_id: itemId}, function(err){
      if(err)
        console.log(err+ " Error occurred");
      else{
        console.log("successfully deleted the checked task");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: itemId}}}, function(err){
      if(err)
        console.log(err+ " Error occurred");
      else{
        console.log("successfully deleted the checked task");
      }
    });
    res.redirect("/"+listName);
  }
});

let port = process.env.PORT;

if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function(){
  console.log("Server started on "+port);
});
