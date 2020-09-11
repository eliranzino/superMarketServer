import joi from "@hapi/joi";

export const productSchema = joi.object({
  productName: joi.string().required(),
  productPrice: joi.number().required(),
  picture: joi.string().required(),
  categoryName: joi.string().required(),
});
