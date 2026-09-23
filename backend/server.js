require("dotenv").config();
const { connectDB, closeDB } = require("./config/db");
const app = require("./app");
async function start() {
  await connectDB();
  const server = app.listen(process.env.PORT || 5000, () =>
    console.log(`GreenCommute API listening on ${process.env.PORT || 5000}`),
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () =>
      server.close(async () => {
        await closeDB();
        process.exit(0);
      }),
    );
}
start().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
