document.addEventListener("DOMContentLoaded", function() {
    const request = require('request');

    setInterval(function() {
        request('http://192.168.0.3/', (error, response, body) => {
            if (!error && response.statusCode === 200) {
                console.log(body);
            } else {
                console.log("I am broke");
            }
        });
    }, 5000);
});