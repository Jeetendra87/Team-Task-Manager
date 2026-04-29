const app = require("./app");
const env = require("./config/env");
const { connectDB } = require("./config/db");

(async () => {
  try {
    await connectDB();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] listening on http://localhost:${env.port}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[server] failed to start", err);
    process.exit(1);
  }
})();
