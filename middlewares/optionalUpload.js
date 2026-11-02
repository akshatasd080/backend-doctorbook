/**
 * Run multer only for multipart requests (so JSON chat still works).
 */

function optionalMultipart(uploadMiddlewares) {
  const chain = Array.isArray(uploadMiddlewares)
    ? uploadMiddlewares
    : [uploadMiddlewares];

  return (req, res, next) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return next();
    }

    let i = 0;
    const run = (err) => {
      if (err) return next(err);
      const mw = chain[i++];
      if (!mw) return next();
      mw(req, res, run);
    };
    run();
  };
}

module.exports = { optionalMultipart };
