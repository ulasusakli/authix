import env from "./config/env";
import app from "./app";

const PORT = env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Authix API is running at http://localhost:${PORT}`);
});