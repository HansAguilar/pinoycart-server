"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
;
;
//^ tas ito yung parang table sa SQL :)
const UserSchema = new mongoose_1.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    cart: [
        {
            itemID: { type: String },
            itemQuantity: { type: Number }
        }
    ],
    role: { type: String, required: true, default: "customer" },
    orders: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'orders' }],
    followed: { type: [String] },
    vendorInfo: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'vendors', default: undefined }
}, {
    timestamps: true
});
const UserModel = mongoose_1.default.model("users", UserSchema); //^ (String: name of table, Object: fields ng table)
exports.UserModel = UserModel;
//# sourceMappingURL=User.js.map