"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});
exports.default = cloudinary_1.v2;
//# sourceMappingURL=Cloudinary.js.map