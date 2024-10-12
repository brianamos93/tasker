const express = require('express')


const app = express();
require('express-async-errors')
const cors = require('cors');

import todoRoutes from "./routes/todoRoutes";
import userRoutes from "./routes/userRoutes";
const middleware = require('./utils/middleware');

app.use(cors());
app.use(express.static('dist'))
app.use(express.json());

app.use(middleware.requestLogger);

app.use("/", todoRoutes);
app.use("/", userRoutes);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);





module.exports = app