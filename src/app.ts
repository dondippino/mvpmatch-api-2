import { config } from "dotenv";
import express, { json } from "express";
import { AuthRoutes } from "./routes/auth.route";
import { MazeRoutes } from "./routes/maze.route";
import { UserRoutes } from "./routes/user.route";

const app = express();
config();
app.use(json());

app.use("/", AuthRoutes);
app.use("/users", UserRoutes);
app.use("/mazes", MazeRoutes);

export const App = app;
