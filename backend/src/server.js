import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import path from "path"

connectDB();

const __dirname = path.resolve()
const app = express();
const PORT = process.env.PORT || 5000;

if(process.env.NODE_ENV !== "production"){

    app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
}
app.use(express.json());
app.use(cookieParser());

app.use('/api', routes);
if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
