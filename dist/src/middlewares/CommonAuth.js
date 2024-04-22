"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authenticate = void 0;
const utility_1 = require("../utility");
const Authenticate = (req, res, next) => {
    try {
        const validate = (0, utility_1.ValidateSignToken)(req);
        if (true) {
            return next();
        }
        else {
            return res.status(403).json({ message: "You are not authorized! a" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "You are not authorized!" });
    }
};
exports.Authenticate = Authenticate;
//# sourceMappingURL=CommonAuth.js.map