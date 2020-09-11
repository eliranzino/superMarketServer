import express from "express";
import { connect } from "../db";
import { ObjectId } from "mongodb";
import { userRequest } from "../models/userRequest";

const router = express.Router();

//get all category names
router.get("/categoryNames", async (req: userRequest, res) => {
    console.log("you in categoryNames");
    
    const db = await connect();
  
    try {
      const categoryNames = await db.collection("products").distinct("categoryName");
      res.send(categoryNames);
    } catch (e) {
      res.status(500).send("Server is unavailable, please try again later");
    }
  });

export { router as category };
