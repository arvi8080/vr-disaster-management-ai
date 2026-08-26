const app = require("./app");
const { PORT } = require("./config/env");

app.listen(PORT, () => {
    console.log(`VR Disaster Management Backend server running on port ${PORT}`);
});