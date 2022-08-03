require('dotenv/config');
const express = require('express');
const morgan = require('morgan')
const app = express();
const api = process.env.API_URL;
const DB_CONNECTION = process.env.DB_CONNECTION;
const mongoose = require('mongoose');
const productsRouter = require('./routes/products')
const categoriesRouter = require('./routes/categories')
const usersRouter = require('./routes/users')
const ordersRouter = require('./routes/orders')
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/errorHandler');

app.use(cors());
app.options('*', cors)

// Middleware
app.use(express.json());
app.use(morgan('combined'));
app.use(authJwt());
app.use(errorHandler)
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))

// Routers
app.use(`${api}/products`, productsRouter)
app.use(`${api}/categories`, categoriesRouter)
app.use(`${api}/users`, usersRouter)
app.use(`${api}/orders`, ordersRouter)

mongoose.connect(DB_CONNECTION)
    .then(()=>{
        console.log('Database connection is ready')
    })
    .catch((err)=>{
        console.log(err)
    })

app.listen(3000, ()=>{
    console.log(`server runnning http://localhost:3000${api}`);
})

