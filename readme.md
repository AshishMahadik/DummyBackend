# Node.JS Boilerplate - JavaScript RESTful APIs

A production ready boilerplate/starter project for quickly building RESTful APIs using Node.js, Express, and Mongoose. Authentication using JWT, request validation, unit and integration tests, continuous integration, docker support, API documentation, pagination, etc. For more details, check the features list below.

## Project Structure

```bash

src\
 |--config\         # Environment variables and configuration related things
 |--controllers\    # Route controllers (controller layer)
 |--docs\           # Swagger files
 |--middlewares\    # Custom express middlewares
 |--models\         # Mongoose models (data layer)
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--app.js          # Express app
 |--server.js        # App entry point

```

## Environment Variables

The environment variables can be found and modified in the `.env` file. They come with these default values:

```bash
# Node server port number
PORT=3000

# Environment State 
NODE_ENV=development

# MongoDb database URL link
DATABASE_URL=mongodb+srv://yourname:<PASSWORD>@yourcluster.03uj08.mongodb.net

# MongoDb database password
DATABASE_PASSWORD=yourpassword

# Jwt Token Secret
JWT_SECRET=writeyoursuppersecretjwtsecret

# Jwt Token expiry Time (in minutes)
JWT_EXPIRY=1440

# Cloudinary Database Cloud name
CLOUD_NAME=yourcloudinarycloudname

# Cloudinary Database key
CLOUDINARY_KEY=258749634558

# Cloudinary Database Secret
CLOUDINARY_SECRET=yourcloudinarysecret
```


## How to access routes

Their is and index.routes.js file in the `src/routes` to mention all the routes in the application.

Use the Proper format to write the routes like below

```javascript

const defaultRoutes = [{
  path: '/auth',    // base path for auth routes
  route: authRoute,
}, {
  path: '/users',   // base path for user routes
  route: userRoute,
}];

```

## Passport Validations

Write jwtVerify methods for every role in your applications like for example 'user','customer','admin', etc

```javascript
const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await User.findById(payload.sub).populate(
      '_org',
      'name email',
    );
    if (!user || user.deleted) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};
```
After that create jwtStrategy for verify method
```javascript
const userJwtStrategy = new JwtStrategy(jwtOptions, userJwtVerify);
```

create authentication middleware for every role seperatly.
The forth argument is the value where the user store in the req like req.user or req.customer

```javascript
const userAuth = () => async (req, res, next) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  new Promise((resolve, reject) => {
    passport.authenticate(
      'userJwt',
      {
        session: false,
      },
      verifyCallback(req, resolve, reject, 'user'),
    )(req, res, next);
  });
```
Add every stragegy which are implimented in the application. It directly apply to `app.js`

```javascript
const JwtStrategy = (Passport) => {
  Passport.use('userJwt', userJwtStrategy);
};
```

## joi validations

In the validations file create the object with property which you want to verify or validate with the help of joi.

You can pass the body, query, params from the req to validate. write on basis on this.

```javascript

const updateProduct = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    price: Joi.number().required()
  }),
};

```

Use the validate function writen in the `src/middleware` to validate the upcoming request with custome write validation.

```javascript

router.patch(validate(productValidation.updateProduct), productController.updateProduct)

```

## Custom Mongoose Plugins

The app also contains 3 custom mongoose plugins that you can attach to any mongoose model schema. You can find the plugins in `src/models/plugins`.

```javascript
const mongoose = require('mongoose');
const { private, paginate, softDelete } = require('./plugins');

const userSchema = mongoose.Schema(
  {
    /* schema definition here */
  },
  { timestamps: true },
);

userSchema.plugin(softDelete);
userSchema.plugin(private);
userSchema.plugin(paginate);

const User = mongoose.model('User', userSchema);
```

### private

The private plugin applies the following changes in the private transform call:

- removes \_\_v, and any schema path that has private: true

### softDelete

The softDelete plugin adds additional delete methods to the mongoose schema to not permanently delete records, instead add a deleted flag. This plugin also overrides `find`, `count` and `countDocuments` methods of mongoose schema to eliminate records having deleted flag true.

### paginate

The paginate plugin adds the `paginate` static method to the mongoose schema.

Adding this plugin to the `User` model schema will allow you to do the following:

```javascript
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};
```

The `filter` param is a regular mongo filter.

The `options` param can have the following (optional) fields:

```javascript
const options = {
  sortBy: 'name:desc', // sort order
  limit: 5, // maximum results per page
  page: 2, // page number
  populate: [
    {
      path: '_org',
      select: 'name email',
    },
  ], // array of fields to populate with field path and fields to select
};
```

The plugin also supports sorting by multiple criteria (separated by a comma): `sortBy: name:desc,role:asc`

The `paginate` method returns a Promise, which fulfills with an object having the following properties:

```json
{
  "results": [],
  "page": 2,
  "limit": 5,
  "totalPages": 10,
  "totalResults": 48
}
```
