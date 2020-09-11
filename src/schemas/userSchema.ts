import Joi from '@hapi/joi';

export const userSchema = Joi.object({
    name: Joi.string().required(),
    lastName: Joi.string().required(),
    userName: Joi.string().required(),
    id: Joi.number().required().min(9),
    password: Joi.string().required(),
    city: Joi.string().required(),
    street: Joi.string().required(),
});