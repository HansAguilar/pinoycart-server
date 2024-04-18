"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const router = express_1.default.Router();
exports.PaymentRoutes = router;
// router.use(Authenticate);
router.post("/create-checkout-session", controllers_1.HandlePayment);
router.post("/success", controllers_1.Success);
//# sourceMappingURL=PaymentRoutes.js.map