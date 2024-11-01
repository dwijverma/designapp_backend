const ensureAuthenticated = (req, res, next) => {
if(req.isAutherticated()){
    return next();
}
else {
    res.redirect("/auth")
}
}

module.exports = ensureAuthenticated