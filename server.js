//////////////////////////////////////////////////////////////////
// Benchmark testing comparing an array with a dictionary       //
//////////////////////////////////////////////////////////////////
// Action                                  | Array | Dictionary //
// Add 10,000,000 objects                  | 750   | 3,000      //
// Search for an object that exists        |  40   |     0      //
// Search for an object that doesn't exist |  50   |     0      //
// Remove an object                        |  25   |     0      //
// Find the length                         |   0   | 3,000      //
//////////////////////////////////////////////////////////////////
// node --max_old_space_size=4096 server.js
// Action                                  | Array | Dictionary //
// Add 10,000,000 objects                  | 750   | 3,000      //
// Search for an object that exists        |  40   |     0      //
// Search for an object that doesn't exist |  50   |     0      //
// Remove an object                        |  25   |     0      //
// Find the length                         |   0   | 3,000      //
//////////////////////////////////////////////////////////////////

var arr = AddObjectsToArray();
SearchForExistingObjectInArray(arr);
SearchForNonExistingObjectInArray(arr);
RemoveObjectFromArray(arr);
FindLengthOfArray(arr);

function AddObjectsToArray(){
  var start = new Date();
  var arr = [];

  for(var i = 0; i < 7500000; ++i){
    var obj = {};
    obj.name  = "Placeholder Name";
    obj.age   = 123;
    obj.email = "testing@example.com";
    obj.state = "MN";
    arr.push(obj);
  }

  var obj = {};
  obj.name  = "Yolo Swag";
  obj.age   = 21;
  obj.email = "me@yahoo.com";
  obj.state = "ABC";
  arr.push(obj);

  for(var i = 0; i < 2500000; ++i){
    var obj = {};
    obj.name  = "Placeholder Name";
    obj.age   = 123;
    obj.email = "testing@example.com";
    obj.state = "MN";
    arr.push(obj);
  }

  var end = new Date() - start;
  console.log("Adding 10,000,000 objects to an array: %dms", end);
  return arr;
}

function SearchForExistingObjectInArray(arr){
  var start = new Date();
  for(var i = 0; i < arr.length; i++) if(arr[i].name == "Yolo Swag") break;
  var end = new Date() - start;
  console.log("Finding one object in the array:       %dms", end);
}

function SearchForNonExistingObjectInArray(arr){
  var start = new Date();
  for(var i = 0; i < arr.length; i++) if(arr[i].name == "No exist") break;
  var end = new Date() - start;
  console.log("Finding a non-existant object in arr:  %dms", end);
}

function RemoveObjectFromArray(arr){
  var start = new Date();
  arr.splice(750000, 1);
  var end = new Date() - start;
  console.log("Removing one object in the array:      %dms", end);
}

function FindLengthOfArray(arr){
  var start = new Date();
  var len = arr.length;
  var end = new Date() - start;
  console.log("Finding length of array:               %dms", end);
}

console.log("---------------------------------------------");

var dict = AddObjectsToDict();
SearchForExistingObjectInDict(dict);
SearchForNonExistingObjectInDict(dict);
RemoveObjectFromDict(dict);
FindLengthOfDict(dict);

function AddObjectsToDict(){
  var start = new Date();
  var dict = {};

  for(var i = 0; i < 7500000; ++i){
    var obj = {};
    obj.name  = "Placeholder Name";
    obj.age   = 123;
    obj.email = "testing@example.com";
    obj.state = "MN";
    dict[i] = obj;
  }

  var obj = {};
  obj.name  = "Yolo Swag";
  obj.age   = 21;
  obj.email = "me@yahoo.com";
  obj.state = "ABC";
  dict["a"] = obj;

  for(var i = 7500000; i < 10000000; ++i){
    var obj = {};
    obj.name  = "Placeholder Name";
    obj.age   = 123;
    obj.email = "testing@example.com";
    obj.state = "MN";
    dict[i] = obj;
  }

  var end = new Date() - start;
  console.log("Adding 10,000,000 objects to a dict:   %dms", end);
  return dict;
}

function SearchForExistingObjectInDict(dict){
  var start = new Date();
  var qwe = dict["a"];
  var end = new Date() - start;
  console.log("Finding one object in the array:       %dms", end);
}

function SearchForNonExistingObjectInDict(dict){
  var start = new Date();
  var qwe = dict["b"];
  var end = new Date() - start;
  console.log("Finding a non-existant object in dict: %dms", end);
}

function RemoveObjectFromDict(dict){
  var start = new Date();
  delete dict["a"];
  var end = new Date() - start;
  console.log("Removing one object in the array:      %dms", end);
}

function FindLengthOfDict(dict){
  var start = new Date();
  var len = Object.keys(dict).length;
  var end = new Date() - start;
  console.log("Finding length of dictionary:          %dms", end);
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var express = require("express");
var app     = express();

app.use(express.static("./static"));
app.set("views", "./views");

app.get("/", function(req, res){
  res.render("index.ejs");
});

const server = app.listen(9001);
const io     = require("socket.io")(server, {"pingInterval": 5000, "pingTimeout": 12000});

var players   = {};
var pCount    = 0;
var idCounter = 0;

io.on("connection", function(socket){
  process.stdout.write("Incoming connection... ");

  if(pCount == 2){
    console.log("refused! Too many players.");
    io.to(socket.id).emit("custom", "Too many people!"); // Send to a specific person
    socket.disconnect(socket.id);
    return;
  }

  var player = {};
  player.num = ++pCount;
  player.id  = ++idCounter;
  players[socket.id] = player;

  console.log("accepted! Player", pCount, "with ID:", idCounter);
  io.to(socket.id).emit("custom", "Your ID is: " + idCounter);

  socket.on("disconnect", function(){
    --pCount;
    var player = players[socket.id];
    console.log("Player", player.num, "with ID:", player.id, "disconnected... remaining players:", pCount);
    delete players[socket.id];
  });

  // Send to everyone but the user that just made the connection
  socket.broadcast.emit("hi", "someone else joined");

  // Do this when the server receives a message titled, "message_c2s"
  socket.on("message_c2s", function(msg){
    console.log(msg);
    io.emit("message_s2c", msg);

    if(msg == "stop") stopServer = true;
  });
});

var stopServer = false;
counter = 0;

var loop = setInterval(function(){
  // console.log(++counter);

  if(stopServer) clearInterval(loop);
}, 1);
