const express = require("express"),
    {start} = require("./start")
    require('dotenv').config()

const app = express()

start(app, "0.0.0.0", process.env.SERVER_PORT, process.env.POSTGRES_CONN)