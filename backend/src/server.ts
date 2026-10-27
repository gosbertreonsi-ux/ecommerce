import app from "./app";
import { env } from "./config/env";

const PORT =
  Number(env.PORT);

const server =
  app.listen(
    PORT,
    () => {
      console.log(
        `E-Commerce API running on port ${PORT}`,
      );

      console.log(
        `Environment: ${env.NODE_ENV}`,
      );
    },
  );

const shutdown = (
  signal: string,
) => {
  console.log(
    `${signal} received. Shutting down gracefully...`,
  );

  server.close(() => {
    console.log(
      "HTTP server closed.",
    );

    process.exit(0);
  });
};

process.on(
  "SIGTERM",
  () => shutdown("SIGTERM"),
);

process.on(
  "SIGINT",
  () => shutdown("SIGINT"),
);