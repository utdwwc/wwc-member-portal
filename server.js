var express = require('express');
var app = express()

var port = process.env.PORT || 4000; 

app.get('/', (req,res) =>{
    res.send('Welcome to programming'); 
})

app.listen(port, ()=> {
    console.log('Listening on', port); 
})
