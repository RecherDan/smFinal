var net = require('net');

var client = new net.Socket();
client.connect(6002, '127.0.0.1', function() {
	console.log('Connected');
	client.write('check');
});

client.on('data', function(data) {
	console.log('Received: ' + data);
	client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});