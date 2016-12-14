var express = require("express");
var app     = express();

app.use(express.static("./static"));
app.set("views", "./views");

app.get("/", function(req, res){
  res.render("index.ejs");
});

const server = app.listen(9001);
const io     = require("socket.io")(server);

io.on("connection", function(socket){
  console.log("A user connected");

  socket.on("disconnect", function(){
    console.log("user disconnected");
  });
});

// Send an event to everyone
io.emit("some event", {for: "everyone"});

io.on("connection", function(socket){
  // Send to everyone but the user that just made the connection
  socket.broadcast.emit("hi");

  // Do this when the server receives a message titled, "message_c2s"
  socket.on("message_c2s", function(msg){
    io.emit("message_s2c", msg);
  });
});
