function requireGuest(req, res, next) {
  if (req.session?.user) {
    return res.redirect('/user/profile');
  }
  next();
};

export default requireGuest;