
var net = require('net');
var mode = process.argv[2];

var client = new net.Socket();
client.connect(6001, '127.0.0.1', function() {
	console.log('Connected');
	client.write(mode);
});

client.on('data', function(data) {
	console.log('Received: ' + data);
	client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});