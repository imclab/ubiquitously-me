$(document).ready(function() {
  
  function say(message) {
    var response = "";
    switch (message.phase) {
      case "queue":
        response = "Queueing " + message.service + " submission.";
        break;
      case "create:before":
        response = "Publishing '" + message.url + "' to " + message.service + ".";
        break;
      case "create:after":
        response = "Successfully submitted " + message.url + "' to " + message.service + ".";
        break;
    }
    return response;
  }
  
  io.setPath('/javascript/socket-io/');
  socket = new io.Socket(null, {port: 8080});
  socket.connect();
  socket.addEvent('message', function(data) {
    var messages = JSON.parse(data);
    for (var i = 0; i < messages.length; i++) {
      var message = messages[i];
      $.jGrowl(say(message), {
        life: 10000,
        beforeOpen: function(e, m, o) {
          
        },
        beforeClose: function() {
          //$.jGrowl("<a href='http://digg.com/'>http://digg.com/</a>", {
          //  header: "Digg Link...",
          //  sticky: true
          //});
        }
      });
    }
  });
});
