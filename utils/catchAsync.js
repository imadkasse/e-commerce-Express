//قمنا بإنشاء هذه الوظيفة للعمل على Error Handler
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
