function requireAdmin(req, res, next) {
    if (!req.session.user || !req.session.user.roles.includes('Administrador')) {
        return res.redirect('/');
    }
    next();
};

export default requireAdmin;