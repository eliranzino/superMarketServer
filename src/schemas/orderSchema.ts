import Joi from '@hapi/joi';

export const orderSchema = Joi.object({
    userId: Joi.string().required(),
    city: Joi.string().required(),
    street: Joi.string().required(),
    shippingDate: Joi.date().required(),
    dateOrdering: Joi.date().required(),
    creditCard: Joi.number().required(),
});
