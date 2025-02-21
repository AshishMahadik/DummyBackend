const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config();

const envVarsSchema = Joi.object()
  .keys({
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string()
      .valid('production', 'development', 'test')
      .required(),
    DATABASE_URL: Joi.string().required().description('MongoDb url'),
    DATABASE_PASSWORD: Joi.string().required().description('Mongodb Password'),
    JWT_SECRET: Joi.string().required().description('jwt secret key'),
    JWT_REFRESH_SECRET: Joi.string()
      .required()
      .description('jwt refresh token key'),
    JWT_EXPIRY: Joi.string()
      .default('30')
      .description('minutes after jwt token expire'),
    JWT_REFRESH_EXIRRY: Joi.string()
      .default('300')
      .description('minutes after jwt token expire'),
    CLOUD_NAME: Joi.string().description('cloudinary cloud name'),
    CLOUDINARY_KEY: Joi.string().description('Cloudinary cloud key'),
    CLOUDINARY_SECRET: Joi.string().description('cloudinary secret key'),
  })
  .unknown();

const { value: envVar, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  Port: envVar.PORT,
  env: envVar.NODE_ENV,
  mongoose: {
    url: envVar.DATABASE_URL,
    password: envVar.DATABASE_PASSWORD,
  },
  cloudinary: {
    cloudName: envVar.CLOUD_NAME,
    apiKey: envVar.CLOUDINARY_KEY,
    apiSecret: envVar.CLOUDINARY_SECRET,
  },
  jwt: {
    secret: envVar.JWT_SECRET,
    refreshSecret: envVar.JWT_REFRESH_SECRET,
    expireIn: envVar.JWT_EXPIRY,
    refreshExpireIn: envVar.JWT_REFRESH_EXIRRY
  },
};
