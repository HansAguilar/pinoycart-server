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
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit")); // Import rate-limiting package
const routes_1 = require("../routes");
exports.default = (app) => __awaiter(void 0, void 0, void 0, function* () {
    // Enable CORS with specific settings
    app.use((0, cors_1.default)({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
        credentials: true,
        optionsSuccessStatus: 200 // Compatibility for legacy browsers
    }));
    // Enable pre-flight across-the-board
    app.options('*', (0, cors_1.default)());
    // Apply rate limiting
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });
    // Apply the rate limiter to all requests
    app.use(limiter);
    // Middleware for parsing cookies
    app.use((0, cookie_parser_1.default)());
    // Middleware for parsing application/json
    app.use(express_1.default.json());
    // Middleware for parsing application/x-www-form-urlencoded
    app.use(express_1.default.urlencoded({ extended: true }));
    // Simple logger for this example
    app.use((req, res, next) => {
        console.log('Request Type:', req.method);
        console.log('Request URL:', req.url);
        console.log('Request Headers:', req.headers);
        next();
    });
    // Root route
    app.get("/", (req, res) => {
        res.json({ message: "Welcome to the API" });
    });
    // Group API routes
    app.use("/api/v1", [routes_1.UserRoutes, routes_1.VendorRoutes, routes_1.ItemRoutes, routes_1.PaymentRoutes]);
    return app;
});
//# sourceMappingURL=ExpressApp.js.map