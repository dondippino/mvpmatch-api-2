"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token || !process.env.AUTH_PUBLIC_KEY) {
            return res.sendStatus(401);
        }
        const session = jsonwebtoken_1.verify(token, process.env.AUTH_PUBLIC_KEY);
        if (typeof session === "string" || !session.exp) {
            return res.status(401).send({ message: "Invalid session" });
        }
        res.locals.session = session;
        const checkExpiry = Math.floor(Date.now() / 1000) - session.exp;
        if (checkExpiry >= 0) {
            return res.status(401).send({ message: "Expired token" });
        }
        next();
    }
    catch (error) {
        res.status(401).send();
    }
};
exports.verifyToken = verifyToken;
