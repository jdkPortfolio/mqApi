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

app.get("/json", (req, res) => {
    if(process.env.MESSAGE_STYLE === "uppercase"){
        res.json({"message":"Hello json".toUpperCase()});
    }else{
        res.json({"message":"Hello json"});
    }
    
})

app.get("/now", (req, res, next) => {
    req.time = new Date().toString();
    next();
}, (req, res) => {
    res.json({"time":req.time})
})

app.get("/:word/echo", (req, res) => {
    res.json({"echo":req.params.word});
})

app.get("/name", (req, res) => {
    res.json({"name":req.query.first+" "+req.query.last});
})

app.post("/send", (req, res) => {
    sendMessage(req, res);
})

function sendMessage(req, res){
    amqp.connect('amqp://localhost:5672', function(error0, connection) {
    if (error0) {
        res.json({success:false, error:error0});
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            res.json({success:false, error:error1});
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























 module.exports = app;