const express=require('express');
const userRouter=require('./router/user.js');
const productRouter=require('./router/product.js');
const bodyParser=require('body-parser');
let server=express();
server.listen(8080);
server.use(express.static(__dirname+'/public'));
server.use(bodyParser.urlencoded({
    extended:false
}));
server.use('/user',userRouter);
server.use('/product',productRouter);