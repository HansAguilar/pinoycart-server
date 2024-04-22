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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.ValidateSignToken = exports.GenerateSignToken = exports.ValidatePassword = exports.GenerateHashPassword = exports.GenerateSalt = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const GenerateSalt = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.genSalt();
});
exports.GenerateSalt = GenerateSalt;
const GenerateHashPassword = (password, salt) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.hash(password, salt);
});
exports.GenerateHashPassword = GenerateHashPassword;
const ValidatePassword = (password, hashPasswordFromDB) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.compare(password, hashPasswordFromDB);
});
exports.ValidatePassword = ValidatePassword;
const GenerateSignToken = (payload) => {
    return jsonwebtoken_1.default.sign({
        _id: payload._id,
        username: payload.username,
        role: payload.role,
    }, config_1.APP_X_KEY, { expiresIn: '30min' });
};
exports.GenerateSignToken = GenerateSignToken;
const ValidateSignToken = (req) => {
    const token = req.get("Authorization");
    if (token) {
        const payload = jsonwebtoken_1.default.verify(token.split(' ')[1], config_1.APP_X_KEY);
        req.user = payload;
        return true;
    }
    else {
        return false;
    }
};
exports.ValidateSignToken = ValidateSignToken;
const verifyToken = (token) => {
    if (token) {
        return jsonwebtoken_1.default.verify(token, config_1.APP_X_KEY);
    }
    else {
        return false;
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=PasswordUtil.js.map