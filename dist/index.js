"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
const dotenv_1 = require("dotenv");
const express_1 = __importStar(require("express"));
const auth_route_1 = require("./routes/auth.route");
const maze_route_1 = require("./routes/maze.route");
const user_route_1 = require("./routes/user.route");
const PORT = process.env.PORT || 5091;
const app = express_1.default();
dotenv_1.config();
app.use(express_1.json());
app.use("/", auth_route_1.AuthRoutes);
app.use("/users", user_route_1.UserRoutes);
app.use("/mazes", maze_route_1.MazeRoutes);
app.listen(PORT, () => {
    console.log(`Server started successfully on ${PORT}`);
});
