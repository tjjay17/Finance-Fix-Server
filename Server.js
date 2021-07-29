const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const redis = require('./redis');
const app = express();

app.use(bodyParser.json());
app.use('*', function(req,res,next){
    res.header('Access-Control-Allow-Origin','http://localhost:3000');
    res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

app.use('/',routes);
//app.use(bodyParser.urlencoded({extended:true}));


app.listen(8000,() => console.log('hi'));