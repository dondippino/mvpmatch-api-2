import { App } from "./app";

const PORT = process.env.PORT || 5091;

App.listen(PORT, () => {
  console.log(`Server started successfully on ${PORT}`);
});
