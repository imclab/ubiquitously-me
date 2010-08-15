var http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		io = require('../javascripts/socket.io-node/index'),
		sys = require('sys'),
		
send404 = function(res){
	res.writeHead(404);
	res.write('404');
	res.end();
};

var spawn = require('child_process').spawn;
var filename = process.ARGV[2];

if (!filename)
  return sys.puts("Usage: node <server.js> <filename>");

server = http.createServer(function(req, res) {
	// your normal server code
	var path = url.parse(req.url).pathname;
	switch (path){
		case '/':
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write('<h1>Welcome. Try the <a href="/chat.html">chat</a> example.</h1>');
			res.end();
			break;
			
		default:
			if (/\.(js|html|swf)$/.test(path)){
				try {
					var swf = path.substr(-4) === '.swf';
					res.writeHead(200, {'Content-Type': swf ? 'application/x-shockwave-flash' : ('text/' + (path.substr(-3) === '.js' ? 'javascript' : 'html'))});
					res.write(fs.readFileSync(__dirname + path, swf ? 'binary' : 'utf8'), swf ? 'binary' : 'utf8');
					res.end();
				} catch(e){ 
					send404(res); 
				}
				break;
			}
		
			send404(res);
			break;
	}
});

server.listen(8080);

function scan(source, pattern, callback) {
  var match;
  source = source.toString();
  while (source.length > 0) {
    if (match = source.match(pattern)) {
      callback(match);
      source  = source.slice(match.index + match[0].length);
    } else {
      source = '';
    }
  }
}

function parseLog(data) {
  var expression = /([\w]+),\s+\[([^\]\s]+)\s+#([^\]]+)]\s+(\w+)\s+--\s+(\w+)?:\s+\[([^\]]+)\](.+)/;
  // Log Format:
  // SeverityID, [Date Time mSec #pid] SeverityLabel -- ProgName: message
  var messages = [];
  scan(data, expression, function(part) {
    var date = part[2];
    var pid = part[3]
    var label = part[4].toLowerCase();
    var app = part[5];
    var phase = part[6];
    var message = JSON.parse(part[7]);
    message.app = app;
    message.phase = phase;
    message.date = date;
    messages.push(message);
  });
  return messages;
}

// socket.io, I choose you
// simplest chat application evar
var buffer = [], 
		json = JSON.stringify,
		io = io.listen(server);
		
io.on('connection', function(client) {
	client.send(json({ buffer: buffer }));
	client.broadcast(json({ announcement: client.sessionId + ' connected' }));
  
  var tail = spawn("tail", ["-f", filename]);
  var tailed = false;
  tail.stdout.on("data", function (data) {
    if (tailed) {
    	sys.puts(data);
    	client.send(JSON.stringify(parseLog(data)));
    } else {
      tailed = true;
    }
  });
  
	client.on('disconnect', function() {
		client.broadcast(json({ announcement: client.sessionId + ' disconnected' }));
	});
});
