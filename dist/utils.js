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
exports.isSession = exports.createJwtToken = exports.encryptPassword = exports.comparePassord = exports.isMinMax = exports.isPostMazeParamValid = exports.isUserParamValid = void 0;
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const isUserParamValid = (payload) => {
    return (payload.username !== undefined &&
        payload.password !== undefined);
};
exports.isUserParamValid = isUserParamValid;
const isPostMazeParamValid = (payload) => {
    return (payload.entrance !== undefined &&
        payload.gridSize !== undefined &&
        payload.walls !== undefined &&
        !(payload.walls.filter((value) => !/^[A-Z]\d+$/.test(value))
            .length > 0) &&
        /^[A-Z]\d+$/.test(payload.entrance) &&
        /^\d+x\d+$/.test(payload.gridSize));
};
exports.isPostMazeParamValid = isPostMazeParamValid;
const isMinMax = (value) => {
    return value === "min" || value === "max";
};
exports.isMinMax = isMinMax;
const comparePassord = (plainPassword, encryptedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bcrypt_1.compare(plainPassword, encryptedPassword);
    return result;
});
exports.comparePassord = comparePassord;
const encryptPassword = (plainPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const encypted = yield bcrypt_1.hash(plainPassword, 10);
    return encypted;
});
exports.encryptPassword = encryptPassword;
const createJwtToken = (payload) => {
    const privateKey = process.env.AUTH_PRIVATE_KEY;
    return (privateKey &&
        jsonwebtoken_1.sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1d",
        }));
};
exports.createJwtToken = createJwtToken;
const isSession = (payload) => {
    return (payload.username !== undefined &&
        payload.iat !== undefined &&
        payload.exp !== undefined);
};
exports.isSession = isSession;
