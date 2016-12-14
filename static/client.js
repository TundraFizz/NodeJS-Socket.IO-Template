var socket = io();

var start;

$("form").submit(function(){
  start = new Date();
  socket.emit("message_c2s", $("#m").val());
  $("#m").val("");
  return false;
});

socket.on("message_s2c", function(msg){
  var end = new Date() - start;
  console.info("Execution time: %dms", end);
  $("#messages").append($("<li>").text(msg));
});

socket.on("hi", function(msg){
  $("#messages").append($("<li>").text("someone else joined"));
});
