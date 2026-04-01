const Joi = require('joi');

const userRegisterSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const roomSchema = Joi.object({
  number: Joi.string().required(),
  type: Joi.string().required(),
  price: Joi.number().positive().required(),
  status: Joi.string().valid('available', 'booked').default('available'),
  images: Joi.array().items(Joi.string().uri()),
  amenities: Joi.array().items(Joi.string())
});

const bookingSchema = Joi.object({
  room: Joi.string().required(),
  checkin: Joi.date().iso().required(),
  checkout: Joi.date().iso().min(Joi.ref('checkin')).required(),
  services: Joi.array().items(Joi.string())
});

module.exports = {
  userRegisterSchema,
  loginSchema,
  roomSchema,
  bookingSchema
};

