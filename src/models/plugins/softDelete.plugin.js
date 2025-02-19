const softDelete = (schema) => {
  // eslint-disable-next-line global-require
  schema.plugin(require('mongoose-delete'), {
    overrideMethods: ['count', 'countDocuments', 'find'],
  });
};

module.exports = softDelete;
