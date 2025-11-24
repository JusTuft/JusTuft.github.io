var http = require('http');
var port = process.env.PORT || 3000;
// var port = 8080 (uncomment to run local)
console.log("Goes to console window");
http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write("Success!");
  res.write("<h2>Welcome to the Hello Application!</h2>");
  res.end();
  console.log("End!");
}).listen(port);
