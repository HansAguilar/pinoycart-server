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
exports.CheckVendorAccess = void 0;
const HttpStatusCodes_1 = require("../utility/HttpStatusCodes");
const CheckVendorAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (userRole === "vendor") {
            next();
        }
        else {
            res.status(HttpStatusCodes_1.HttpStatusCodes.Forbidden).json({ message: "MW: You are not authorized!" });
        }
    }
    catch (error) {
        console.log("check vendor access file:::", error);
        res.status(HttpStatusCodes_1.HttpStatusCodes.Forbidden).json({ message: "You are not authorized!" });
    }
});
exports.CheckVendorAccess = CheckVendorAccess;
//# sourceMappingURL=CheckVendorAccess.js.map