var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const process = require('process');
var fs = require('fs');
var robot = require('robotjs');
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null);

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}

connections = []

server.listen(process.env.PORT || 3000);
console.log(`Flipper server is running on ${results["en0"][0]}...`)
let current = new Date()
var message = `[*] (${current.getFullYear()}/${current.getMonth() + 1}/${current.getDate()}[${current.getHours()}:${current.getMinutes()}:${current.getSeconds()}]) - Flipper has started\n`
fs.appendFile('history.txt', message, function(err, data) {
    if (err) {
        return console.log(err);
    }
});

io.sockets.on('connection', function(socket) {
    var address = socket.handshake;
    connections.push(socket)
    let current = new Date()
    let message = `[i] (${current.getFullYear()}/${current.getMonth() + 1}/${current.getDate()}[${current.getHours()}:${current.getMinutes()}:${current.getSeconds()}]) | ${address.address.replace('::ffff:', '')} (${socket.id}) - Is connected\n`
    fs.appendFile('history.txt', message, function(err, data) {
        if (err) {
            return console.log(err);
        }
    });

    socket.on('disconnect', function(data) {
        connections.splice(connections.indexOf(socket), 1);
        var address = socket.handshake;
        let current = new Date()
        let message = `[i] (${current.getFullYear()}/${current.getMonth() + 1}/${current.getDate()}[${current.getHours()}:${current.getMinutes()}:${current.getSeconds()}]) | ${address.address.replace('::ffff:', '')} (${socket.id}) - Is disconnected\n`
        fs.appendFile('history.txt', message, function(err, data) {
            if (err) {
                return console.log(err);
            }
        });
    });

    socket.on('NodeJS Server Port', function(data) {
        if (data == "prev") {
            robot.keyTap('left');
        } else if (data == "next") {
            robot.keyTap('right');
        }
    });
})