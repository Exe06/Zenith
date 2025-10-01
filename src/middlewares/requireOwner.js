function requireOwner(req, res, next) {
  if (!req.session?.user.roles.includes('Propietario')) {
    return res.redirect('/');
  }
  next();
};

export default requireOwner;