"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const prisma_1 = require("../../prisma");
const utils_1 = require("../utils");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        if (!utils_1.isUserParamValid(body)) {
            return res.status(400).send({ message: "Invalid entry" });
        }
        const user = yield prisma_1.prisma.user.findUnique({
            where: {
                username: body.username,
            },
        });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        const hasCorrectPassword = yield utils_1.comparePassord(body.password, user.password);
        if (!hasCorrectPassword) {
            return res.status(403).send({ message: "Incorrect login credentials" });
        }
        const access_token = utils_1.createJwtToken({ username: body.username });
        res.send({
            access_token,
        });
    }
    catch (error) {
        return res.status(500).send();
    }
});
exports.login = login;
