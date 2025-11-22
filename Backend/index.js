const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const PORT = 3000;

app.use(express.json());
app.use(cors());
dotenv.config();

const dataRoutes = require("./routes/dataRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
app.use("/api", dataRoutes);
app.use("/api", medicineRoutes);




app.listen(PORT, () => {
    console.log("Techclinic System Listening to PORT ", PORT);
})