const bodyParser = require("body-parser");   // we have to require bodyparser after we have installed it. 
const express = require("express");          // same goes for express.
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();        // creating app constant using express.

app.set('view engine', 'ejs');        // tells our app which is generated using express to use ejs as it's view engine.


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Chirantan:NoSQLDatabase@cluster0.mpups.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new Item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema] 
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){       // get route
 
    Item.find({}, function(err, foundItems){
   
    if (foundItems.length === 0){

        Item.insertMany(defaultItems, function(err){
    if(err){
        console.log(err);
    }   else   {
        console.log("Successfully saved default Items to DB");

    }
});

res.redirect("/");

} else {

   res.render("list", {listTitle: "Today", newListItems: foundItems});
}
   });

});


app.post("/", function(req, res){
   const itemName =  req.body.newItem;
   const listName = req.body.list;

   const item = new Item({
    name: itemName
   });

   if (listName === "Today"){
    item.save();
    res.redirect("/");
     
   } else {
       List.findOne({name: listName}, function(err, foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
    })
   }
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if(!err){
                console.log("Successfully Deleted checked item");
                res.redirect("/");
            }
        });

    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
               res.redirect("/" + listName); 
            }
        });
        
    }

});

app.get("/:customListName", function(req, res){
   const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
       if(!err){
        if(!foundList){
            // Create a new list
            const list = new List({
                name: customListName, 
                items: defaultItems
             });
         
             list.save();
             res.redirect("/" + customListName);
        }  else  {
            console.log("Exists!");
            // Show an existing list
            res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
           }
         }
     });


});

app.post("/work", function(req, res){

    console.log(req.body);
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}


app.listen(port, function(){               // we listen on port 3000
    console.log("Server has started successfully");  // we console.log that out server has started
});
