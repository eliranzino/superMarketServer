import Joi from "@hapi/joi";
import { Request, Response, NextFunction } from "express";

// this express middleware is a function that expects a Joi schema
// it validates that the request body fits the schema

// if the validation is ok, it passes the request on
// if it's not, it ends the request and responds with 400 and the validation error
export const validateSchema = (schema: Joi.Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);
        if (error) {
            console.log("you have error")
            return res.status(400).send(error.details[0].message);
        }
        next();
    }
}