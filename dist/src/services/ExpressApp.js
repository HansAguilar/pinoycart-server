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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("../routes");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
exports.default = (app) => __awaiter(void 0, void 0, void 0, function* () {
    app.use((0, cors_1.default)({
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        origin: '*',
    })); //! this solves the cors problem in frontend
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        next();
    });
    app.use('/uploads', express_1.default.static('uploads'));
    app.use("/api/v1", [routes_1.UserRoutes, routes_1.VendorRoutes, routes_1.ItemRoutes, routes_1.PaymentRoutes]);
    return app;
});
//# sourceMappingURL=ExpressApp.js.map