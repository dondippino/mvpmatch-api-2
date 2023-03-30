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
exports.create = void 0;
const prisma_1 = require("../../prisma");
const utils_1 = require("../utils");
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { body } = req;
        if (!utils_1.isUserParamValid(body)) {
            return res.status(400).send();
        }
        const encryptedPassword = yield utils_1.encryptPassword(body.password);
        const user = yield prisma_1.prisma.user.create({
            data: Object.assign({}, Object.assign(Object.assign({}, body), { password: encryptedPassword })),
            select: {
                username: true,
            },
        });
        res.send(user);
    }
    catch (error) { }
});
exports.create = create;
