function errorHandler(err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        return res.status(401).json({ message: "The user is not authorized" });
    }
    if (err.name === "ValidationError") {
        return res.status(401).json({ message: err });
    }
    if (err) return res.status(404).json({ message: err });
}

module.exports = errorHandler;