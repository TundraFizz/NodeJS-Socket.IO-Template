var socket = io();

$("form").submit(function(){
  socket.emit("message_c2s", $("#m").val());
  $("#m").val("");
  return false;
});

socket.on("message_s2c", function(msg){
  $("#messages").append($("<li>").text(msg));
});

socket.on("hi", function(msg){
  $("#messages").append($("<li>").text("someone else joined"));
});
