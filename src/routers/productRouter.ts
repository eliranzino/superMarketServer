import express from "express";
import { productSchema } from "../schemas/productSchema";
import { connect } from "../db";
import { ObjectId } from "mongodb";
import { userRequest } from "../models/userRequest";
import { cartSchema } from "../schemas/cartSchema";

const router = express.Router();

//search for a specific product
router.get("/search/:productName", async (req: userRequest, res) => {
  console.log("you in search")
  const { id } = req.user;
  console.log({ id });
  const { productName } = req.params;
  console.log({productName})
  const db = await connect();
  const pattern = new RegExp(productName.toString(), "i");
  console.log({pattern})
  try {
    const products = await db.collection("products").find({ productName: pattern }).toArray();
    console.log({products})
    res.send(products);
  } catch (e) {
    res.status(500).send("Server is unavailable, please try again later");
  }
});

//get all products
router.get("/shoppingPage", async (req: userRequest, res) => {
  const { userId } = req.user;
  console.log({userId});
const db = await connect();

try {
  const products = await db.collection("products").find().toArray();
  res.send(products);
} catch (e) {
  res.status(500).send("Server is unavailable, please try again later");
}
});

//get products amount
router.get("/productsAmount", async (req: userRequest, res) => {
  console.log("you in productsAmount");
    const db = await connect();
    try {
      const productsAmount = await db.collection("products").find().count();
      console.log({productsAmount})
      res.json(productsAmount);
    } catch (e) {
      res.status(500).send("Server is unavailable, please try again later");
    }
  });

//get all products by category
router.get("/shoppingPage/:categoryName", async (req: userRequest, res) => {
  console.log("you in get all products by category");
  const { id } = req.user;
  console.log(id)
  if(!id){
    return;
  }
  const { categoryName } = req.params;

  const db = await connect();
  try {
    const products = await db.collection("products").find({ categoryName }).toArray();
    console.log({products})
    res.send(products);
  } catch (e) {
    res.status(500).send("Server is unavailable, please try again later");
  }
});


//get products that user have in cart
router.get("/:userId", async (req: userRequest, res) => {
  const { userId } = req.user;
  const db = await connect();

  if (isNaN(Number(userId))) {
    res.status(400).send("userId must be a number");
    return;
  }
  try {
    const products = await db.collection("products").find({ userId }).toArray();
    res.send(products);
  } catch (e) {
    res.status(500).send("Server is unavailable, please try again later");
  }
});


//admin create new product
router.post("/", async (req: userRequest, res) => {
  const { id: userId } = req.user;
  console.log("this is req user", userId);
  const { productName, productPrice, picture, categoryName } = req.body;
  console.log(productName, productPrice, picture, categoryName, userId);

  const result = productSchema.validate({
    productName,
    productPrice,
    picture,
    categoryName,
  });

  if (result.error) {
    res.status(400).send(JSON.stringify({ success: false, msg: result.error }));
    return;
  }

  const db = await connect();
  const { insertedId } = await db.collection("products").insertOne({ productName, productPrice, picture, categoryName });
  console.log({ insertedId });

  const newProduct = {
    _id: insertedId,
    productName,
    productPrice,
    picture,
    categoryName,
  };
  console.log({ newProduct });

  if (insertedId) {
    res.send(newProduct);
  } else {
    res
      .status(500)
      .send(JSON.stringify({ success: false, msg: "Please try again later." }));
  }
});


//admin delete product
router.delete("/:id", async (req: userRequest, res) => {
  const { id: userId } = req.user;
  console.log("the req user is-", userId);
  const { id: productId } = req.params;

  const db = await connect();
  const { deletedCount } = await db
    .collection("products")
    .deleteOne({ _id: new ObjectId(productId) });
  console.log(deletedCount);
  if (deletedCount! > 0) {
    console.log({productId})
    res.status(200).send(JSON.stringify(productId));
  } else {
    res.send("there is no product to delete");
  }
});

//admin edit product 
router.put("/:id", async (req: userRequest, res) => {
  console.log('you in edit')
  const { id: userId } = req.user;
  const { id: productId } = req.params;

  const { productName, productPrice, picture, categoryName } = req.body;
  console.log({ productName, productPrice, picture, categoryName })

  const db = await connect();
  const { modifiedCount } = await db.collection("products").updateOne({ _id: new ObjectId(productId) },
      { $set: { productName, productPrice, picture, categoryName } }
    );
  console.log({ modifiedCount });
  res.send({ success: modifiedCount > 0 });
});

export { router as products };
