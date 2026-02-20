const express = require("express");
const cors = require("cors");
require("dotenv").config();
console.log("ENV KEYS:", Object.keys(process.env));
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("DATABASE_URL:", process.env.DATABASE_URL);
const path = require("path");


const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
const testRoutes = require('./routes/test.routes');
app.use('/api/test', testRoutes);

const eventRoutes = require('./routes/event.routes');
app.use('/api/events', eventRoutes);

const registrationRoutes = require('./routes/registration.routes');
app.use('/api/registrations', registrationRoutes);

const adminRoutes = require('./routes/admin.routes');
app.use('/api/admin', adminRoutes);

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const feedbackRoutes = require('./routes/feedback.routes');
app.use('/api', feedbackRoutes);