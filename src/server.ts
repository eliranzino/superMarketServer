import express from 'express';
import cors from 'cors';
import { SECRET } from "./routers/secret";
import { products } from "./routers/productRouter";
import {users} from './routers/userRouter'
import expressJwt from 'express-jwt';
import {closeDb} from  './db';
import { carts } from './routers/cartRouter';
import { orders } from './routers/orderRouter';
import { category } from './routers/categoryRouter';
import path from 'path';
//import fileUpload from 'express-fileupload';


const PORT = 4000;

const app = express();

app.use(express.json());
app.use(cors());
app.use(expressJwt({ secret: SECRET }).unless({ path: ['/users/register', '/users/login', '/users/checkId', '/products/productsAmount', '/orders/ordersAmount'] }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', users);
app.use('/products', products);
app.use('/carts', carts);
app.use('/orders', orders);
app.use('/category', category);

app.get('/', (req, res) => {
    res.send('Hi there!');
});


app.listen(PORT, () => console.log(`Server is up at ${PORT}`));
process.on('SIGINT', function () {  //sigint its event it will happen when fire the event
    console.log('closing mongo connection');
    closeDb();
})