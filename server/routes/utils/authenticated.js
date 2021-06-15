let authenticated = (req, res, next) => {
    if (req.user !== undefined) {
        next();
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.sendStatus(401);
    }
};

export default authenticated;
