const cloudinary = require('cloudinary');
// eslint-disable-next-line prefer-destructuring
const Readable = require('stream').Readable;
const env = require('../env');

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

module.exports = {
  destroy: cloudinary.v2.uploader.destroy,
  upload_stream: cloudinary.v2.uploader.upload_stream,
  upload: async (file) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    await new Promise((resolve, reject) => {
      const readable = new Readable();
      readable._read = () => {};
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(
        cloudinary.v2.uploader.upload_stream(
          {
            folder: 'training-api',
            format: 'jpg',
            return_delete_token: true,
            discard_original_filename: true,
          },
          (err, res) => {
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          },
        ),
      );
    }),
};
