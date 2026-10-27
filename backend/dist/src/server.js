"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const PORT = Number(env_1.env.PORT);
const server = app_1.default.listen(PORT, () => {
    console.log(`E-Commerce API running on port ${PORT}`);
    console.log(`Environment: ${env_1.env.NODE_ENV}`);
});
const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
    });
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
