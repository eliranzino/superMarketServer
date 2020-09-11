import Joi from '@hapi/joi';

export const loginSchema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required(),

});