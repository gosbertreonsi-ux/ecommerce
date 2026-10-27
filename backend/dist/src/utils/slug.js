"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = void 0;
const slugify = (text) => text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
exports.slugify = slugify;
