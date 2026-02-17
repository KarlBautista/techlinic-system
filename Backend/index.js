const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const cors = require("cors");
const PORT = 3500;

// CORS must handle preflight (OPTIONS) BEFORE auth middleware runs
app.use(cors({
    origin: true,                   // reflect request origin
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204       // some browsers choke on 200 for OPTIONS
}));

app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const dataRoutes = require("./routes/dataRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const diseasesRoutes = require("./routes/diseasesRoute");
const notificationRoutes = require('./routes/notificationRoutes');

app.use("/api", authRoutes);
app.use("/api", dataRoutes);
app.use("/api", medicineRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", diseasesRoutes);
app.use("/api", notificationRoutes);




app.listen(PORT, () => {
    console.log("Techclinic System Listening to PORT ", PORT);
})