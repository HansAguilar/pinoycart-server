"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidObjectId = void 0;
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};
exports.isValidObjectId = isValidObjectId;
//# sourceMappingURL=IsValidObjectId.js.map