import express from "express";
import { connect } from "../db";
import { ObjectId } from "mongodb";
import { userRequest } from "../models/userRequest";
import { cartSchema } from "../schemas/cartSchema";

const router = express.Router();

//get cart of user
router.get("/", async (req: userRequest, res) => {
  const { id: userId } = req.user;
  const db = await connect();

  try {
    let cart = await db.collection("carts").find({ userId }).toArray();
    console.log("the cart is", cart);
    if (cart.length === 0) {
      res.send(null);
      return;
    }
    const theCartObject = cart[0];
    const productsInCart = theCartObject.products;
    console.log({ productsInCart });
    const productsIds = productsInCart.map(
      (product: any) => new ObjectId(product.id)
    );
    const productsDocumentsArray = await db.collection("products").find(
        {
          _id: {
            $in: productsIds,
          },
        },
        { fields: { _id: 1, productPrice: 1, productName: 1 } }
      )
      .toArray();
    console.log({ productsDocumentsArray });

    const productsDocumentsById = productsDocumentsArray.reduce(function (
      map,
      product
    ) {
      const { productPrice, productName } = product;
      map[product._id] = { productPrice, productName };
      return map;
    },
    {});

    const productsForCart = productsInCart.map((product: any) => {
      return { ...product, ...productsDocumentsById[product.id] };
    });
    console.log({ productsForCart });

    const getCart = (theCartObject.products = productsForCart);
    console.log({ theCartObject });
    const roundedTotalPrice = +theCartObject.totalPrice.toFixed(2)
    console.log({roundedTotalPrice})
    theCartObject.totalPrice = roundedTotalPrice
    console.log({theCartObject})
    console.log("cart.length", cart.length);
    if (cart.length === 0) {
      res.send(null);
    } else {
      res.send(theCartObject);
    }
  } catch (e) {
    res.status(500).send("Server is unavailable, please try again later");
  }
});

// create cart
router.post("/", async (req: userRequest, res) => {
  const { id: userId } = req.user;
  console.log("this is req user", userId);

  //const { products } = req.body;
  console.log("here are the productsRequest");

  const newDate = new Date();
  const day = newDate.getDate();
  const month = newDate.getMonth() + 1;
  const year = newDate.getFullYear();
  const date = day + "/" + month + "/" + year;
  console.log({date})

  const result = cartSchema.validate({ userId, date });
  console.log("this is the result from the validate-", result);
  if (result.error) {
    console.log("you have an error");
    res.status(400).json({ success: false, msg: result.error });
    return;
  }
  const db = await connect();

//   const productsIds = products.map((product: any) => new ObjectId(product.id));
//   const productsDocumentsArray = await db
//     .collection("products")
//     .find(
//       {
//         _id: {
//           $in: productsIds,
//         },
//       },
//       { fields: { _id: 1, productPrice: 1, productName: 1 } }
//     )
//     .toArray();
//   console.log({ productsDocumentsArray });

//   const productsDocumentsById = productsDocumentsArray.reduce(function (
//     map,
//     product
//   ) {
//     const { productPrice, productName } = product;
//     map[product._id] = { productPrice, productName };
//     return map;
//   },
//   {});

//   const productsForCart = products.map((product: any) => {
//     return { ...product, ...productsDocumentsById[product.id] };
//   });
//   console.log({ productsForCart });
//   let totalPrice = 0

//   const a  = productsForCart.map((product:any) => {
//     return product.amount * product.productPrice
//   });
//   console.log({a})
//   a.forEach((schum:any) => {
//     totalPrice += schum
//   });
// console.log({totalPrice})

  const { insertedId } = await db.collection("carts").insertOne({ userId, date, totalPrice:0, products:[] });
  console.log({ insertedId });
  const newCart = {
    _id: insertedId,
    userId,
    date,
    totalPrice:0,
    products:[]
    // products: productsForCart,
  };
  console.log({ newCart });

  if (insertedId) {
    res.send(newCart);
  } else {
    res
      .status(500)
      .send(JSON.stringify({ success: false, msg: "Please try again later." }));
  }
});

//clear cart
router.put("/clearCart/:cartId", async (req: userRequest, res) => {
  console.log('you in delete cart')
  const { id: userId } = req.user;
  console.log("the req user is-", userId);
  const { cartId } = req.params;

  const db = await connect();
  const { result } = await db.collection("carts").updateOne({ _id: new ObjectId(cartId) },{$set: {products:[], totalPrice:0}});
  console.log(result);
  if (result.ok) {
    res.send(JSON.stringify("cart cleared"));
  } else {
    res.send("there is no cart to delete");
  }
});

//add product to existing cart
router.put("/addProductToCart", async (req: userRequest, res) => {
  console.log("addProductToCart")
  const { id: userId } = req.user;
  console.log("this is req user", userId);
  const { product } = req.body;
  console.log({ product });
  const db = await connect();


  const productsIds = product.map((product: any) => new ObjectId(product.id));
  const productsDocumentsArray = await db.collection("products").find(
      {
        _id: {
          $in: productsIds,
        },
      },
      { fields: { _id: 1, productPrice: 1, productName: 1, picture:1 } }
    )
    .toArray();
  console.log({ productsDocumentsArray });

  const productsDocumentsById = productsDocumentsArray.reduce(function (
    map,
    product
  ) {
    const { productPrice, productName, picture } = product;
    map[product._id] = { productPrice, productName, picture };
    return map;
  },
  {});

  const productsForCart = product.map((product: any) => {
    return { ...product, ...productsDocumentsById[product.id] };
  });
  console.log({ productsForCart });
  const productObj = productsForCart[0];
  console.log({productObj})
  const amountToAdd = productObj.amount*productObj.productPrice;
console.log({amountToAdd})

  const { result } = await db.collection("carts").updateOne({ userId }, { $push: { products: productObj } });
  const { matchedCount } = await db.collection("carts").updateMany({ userId }, { $inc:{totalPrice:amountToAdd} });
console.log({matchedCount})
  console.log({ result });
  if(result.ok){
    res.send(productObj);
  }else{
    res.send("product didnt added to cart");
  }
});

//delete item from cart
router.put("/:productId", async (req: userRequest, res) => {
  console.log('delete item from cart')
  const { id: userId } = req.user;
  console.log("the req user is-", userId);
  const { productId } = req.params;

  const db = await connect();
  const productsArrayFromUserCart = await db
    .collection("carts")
    .find({ userId }, { fields: { products: 1, _id: 0 } })
    .toArray();
  console.log({ productsArrayFromUserCart });
  const a = productsArrayFromUserCart[0].products;
  const productToDeleteFromCart = a.find(
    (product: any) => product.id === productId
  );
  console.log({ productToDeleteFromCart }); //should be obj
  const amountToDelete = productToDeleteFromCart.amount*productToDeleteFromCart.productPrice;
console.log({amountToDelete}) //to decrease

  const { result } = await db
    .collection("carts").update(
      { userId },
      { $pull: { products: { $in: [productToDeleteFromCart] } } }
    );
  console.log({ result });
  console.log(result.ok)

  const { matchedCount } = await db.collection("carts").updateMany({ userId }, { $inc:{totalPrice:-amountToDelete} });




  if(result.ok){
    res.send(productId);
  }else{
    res.status(400).send("Item didnt deleted");
  }
  
});



export { router as carts };
