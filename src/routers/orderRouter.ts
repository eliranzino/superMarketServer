import express from "express";
import { connect } from "../db";
import { ObjectId } from "mongodb";
import { userRequest } from "../models/userRequest";
import { orderSchema } from "../schemas/orderSchema";
import path from 'path';
import fs from 'fs';

const router = express.Router();

//getReceipt
router.get('/getReceipt/:orderId', async (req: userRequest, res, next) => {
  console.log('you in getReceipt')
  const { orderId } = req.params;
const receiptNumber = Math.random();
let totalAmount = 0;
const Path = path.join(__dirname + "/../public/receipt/receipt" + receiptNumber + ".txt");
const db = await connect();
const order = await db.collection("orders").find({ _id: new ObjectId(orderId) }).toArray();
const orderObj = order[0];
fs.writeFile(Path, orderObj.products.map((product:any) => {
  totalAmount += product.amount * product.productPrice;
  return product.productName + "\n" + product.amount + " * " + product.productPrice + "= " + product.productPrice * product.amount + "\n\n";
}) + "\n total = " + totalAmount + "\n Shipping date = " + orderObj.shippingDate + "\n City = " + orderObj.city + "\n Date = " + orderObj.dateOrdering+ "\n Credit card = " + orderObj.creditCard , function (err){
  if(err) {
      return console.log(err);
  }
  console.log("The file was saved!");
}); 
console.log('the Path is: ', Path, 'and the type is- ', typeof(Path));
res.download(Path, 'receipt.txt');
});

//how many orders total
router.get("/ordersAmount", async (req: userRequest, res) => {
  console.log("you in get orders");
  const db = await connect();
  try {
    const ordersAmount = await db.collection("orders").count();
    console.log("you in try", ordersAmount);
    res.json(ordersAmount);
  } catch (e) {
    res.status(500).send("Server is unavailable, please try again later");
  }
});

//get order of user
router.get("/", async (req: userRequest, res) => {
  console.log('get order of user')
  const { id: userId } = req.user;
  console.log("the userId is ", userId)
  const db = await connect();

  try {
    const orders = await db.collection("orders").find({userId}).toArray();
    console.log('orders:', orders);
    console.log(orders.length)
    const theOrderObj = orders[orders.length-1];
    if(orders.length===0){
      console.log('need to send false as there is no order', orders.length)
      res.send(null);
    }else{
      res.send(theOrderObj);
    }
  } catch (e) {
    res.status(500).send("Server is unavailable, please try again later");
  }
});



//user create an order
router.post("/", async (req: userRequest, res) => {
  console.log('im in create order')
  const { id: userId } = req.user;
  console.log("this is req user", userId);
  const { city, street, shippingDate, creditCard } = req.body;
  console.log({ city, street, shippingDate, creditCard });

  const db = await connect();
  const shippingDatesArray = await db.collection("orders").find({}, {fields:{shippingDate:1, _id:0}}).toArray();
  console.log({shippingDatesArray})
  const howManyOrdersInSameDayArray = shippingDatesArray.filter(shippingDateCheck=>shippingDateCheck.shippingDate===shippingDate);
  console.log({howManyOrdersInSameDayArray});
  console.log("howManyOrdersInSameDayArray.length", howManyOrdersInSameDayArray.length)
  if(howManyOrdersInSameDayArray.length===3){
    console.log("All deliveries are taken, please choose other day.");
    res.send({ success: false, msg: "All deliveries are taken, please choose other day." });
  }else{
    const newDate = new Date();
    const day = newDate.getDate();
    const month = newDate.getMonth() + 1;
    const year = newDate.getFullYear();
    const dateOrdering = day + "/" + month + "/" + year;
    console.log({dateOrdering})

    const result = orderSchema.validate({
      userId,
      city,
      street,
      shippingDate,
      creditCard,
      dateOrdering,
    });
    if (result.error) {
      res.status(400).send(JSON.stringify({ success: false, msg: result.error }));
      return;
    }
  
    const products = await db.collection("carts").find({userId}, {fields:{products:1, _id:0}}).toArray();
    console.log({products})
    const productsObj = products[0].products;
    console.log('productsObj: ', productsObj)
    const { insertedId } = await db.collection("orders").insertOne({ city, street, shippingDate, creditCard, dateOrdering, userId, products: productsObj  });
    console.log({ insertedId });
    const newOrder = {
      _id: insertedId,
      userId,
      city,
      street,
      shippingDate,
      creditCard,
      dateOrdering,
      products: productsObj
    };
    console.log({ newOrder });
  
    if (insertedId) {
      //delete the cart:
      const { deletedCount } = await db.collection("carts").deleteOne({ userId });
      console.log({deletedCount})
      //and send the order
      res.send({ success: true, result: newOrder });
    } else {
      res
        .status(500)
        .send(JSON.stringify({ success: false, msg: "Please try again later." }));
    }
  }
 
});

export { router as orders };
