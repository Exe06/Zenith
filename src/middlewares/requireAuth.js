function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.redirect('/user/login');
  }
  next();
};

export default requireAuth;