import express from "express";
import todoRoutes from "./routes/todoRoutes";
import userRoutes from "./routes/userRoutes"


const cors = require('cors')
const middleware = require('./utils/middleware')


const app = express()
app.use(cors())
app.use(express.json())
app.use("/", todoRoutes);
app.use("/", userRoutes)
app.use(middleware.requestLogger)


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports = app