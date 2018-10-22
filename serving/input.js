document.addEventListener("DOMContentLoaded", function() {
    const socket = require('socket.io-client')('http://localhost:9000');
    socket.on('connect', function() {
        console.log("Connected")
    });
    socket.on('event', function(data) {
        console.log("Event")
    });
    socket.on('disconnect', function() {
        console.log("Disconnected")
    });
})