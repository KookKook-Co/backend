const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', function() {
    client.subscribe('/1/temperature', function(err) {
        if (!err) {
            client.publish('/1/ammonia', '90');
        }
    });
});

client.on('message', function(topic, message) {
    // message is Buffer
    console.log(message.toString());
    client.end();
});
