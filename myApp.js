let express = require('express');
let bodyParser = require('body-parser');
let app = express();
require('dotenv').config()
var amqp = require('amqplib/callback_api');


app.use(bodyParser.urlencoded({extended:false}))

// app.use((req, res, next) => {
//     console.log(req.method+" "+req.path+" - "+req.ip);
//     next();
// })
// app.get("/", (req, res) => {
//     res.sendFile(absPath+'/views/index.html');
// })
app.get("/receive", (req, res) => {
    receiveMessage(res);
})

app.post("/send", (req, res) => {
    sendMessage(req, res);
})

function sendMessage(req, res){
    amqp.connect('amqps://jozawhil:nHgxatkkUqkkQALkKeXPmKYConZu5On5@moose.rmq.cloudamqp.com/jozawhil', function(error0, connection) {
    if (error0) {
        res.json({success:false, error0:error0});
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            res.json({success:false, error1:error1});
        }

        var queue = 'testemails';
        var msg = {data:{email:req.query.email, message:req.query.message}};

        channel.assertQueue(queue, {
            durable: false
        });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));

        var response = {success:true,message:'Message Sent Successfully'};
        res.json(response);
    });
    setTimeout(function() {
        connection.close();
        // process.exit(0);
    }, 500);
});
}

function receiveMessage(res){
    var emails = [];
    amqp.connect('amqps://jozawhil:nHgxatkkUqkkQALkKeXPmKYConZu5On5@moose.rmq.cloudamqp.com/jozawhil', function(error0, connection) {
        if (error0) {
            res.json({success:false, error0:error0});
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                res.json({success:false, error1:error1});
            }

        var queue = 'testemails';

        channel.assertQueue(queue, {
            durable: false
        });

        channel.consume(queue, function(msg) {
            emails.push(JSON.parse(msg.content.toString()));
            console.log(emails);
            
        }, {
            noAck: true,
        });
    });
    setTimeout(function() {
        connection.close();
    }, 1000);
});
} 























 module.exports = app;
