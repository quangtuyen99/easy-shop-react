const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const morgan = require('morgan'); //logging
const mongoose = require('mongoose'); //mongodb


// Goi bien moi truong
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const api = process.env.API_URL;

// router
const productRouter = require('./routers/product');
const categoryRouter = require('./routers/categories');
const userRouter = require('./routers/users');
const orderRouter = require('./routers/orders');

//middleware
app.use(bodyParser.json()); // Chuyển đổi thành json để server hiểu
app.use(morgan('tiny')); // Sử dụng get, post,.. và đưa lên server
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads')); // Đường dẫn ảnh
app.use(function (err, req, res, next) {
    if(err.name === 'UnauthorizedError') {
        res.status(401).json({ message: "The user not authorized" })
    }

    if(err.name === 'ValidationError') {
        res.status(401).json({ message: err })
    }

    res.status(500).json(err);
})

// Router Product
app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/users`, userRouter);
app.use(`${api}/orders`, orderRouter);

mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Database connection')
})
.catch((err) => {
    console.log(err)
})

app.listen(3000, () => {
    console.log("server is running in 3000")
})