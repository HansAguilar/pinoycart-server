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
    // Configure CORS middleware for all routes
    app.use((0, cors_1.default)({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
        // Necessary if you're sending credentials like cookies
        optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
    }));
    // Middleware for cookies and body parsing
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.options('*', (0, cors_1.default)()); // Include before your other routes
    app.use((req, res, next) => {
        console.log('Request Type:', req.method);
        console.log('Request URL:', req.url);
        console.log('Request Headers:', req.headers);
        next();
    });
    // Simple root route
    app.get("/", (req, res) => {
        res.json({ message: "Welcome to the API" });
    });
    // API routes
    app.use("/api/v1", [routes_1.UserRoutes, routes_1.VendorRoutes, routes_1.ItemRoutes, routes_1.PaymentRoutes]);
    return app;
});
//# sourceMappingURL=ExpressApp.js.map