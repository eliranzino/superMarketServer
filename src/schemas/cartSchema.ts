import joi from "@hapi/joi";

export const cartSchema = joi.object({
  date: joi.date().required(),
  userId: joi.string().required(),
  //products: joi.array().required(),  //array of objects, every object have id and amount, price no
});