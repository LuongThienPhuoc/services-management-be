require("dotenv").config();
const express = require("express")
const app = express()
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require('cookie-parser')
const cluster = require('cluster');
const cpuCount = require('os').cpus().length;
const route = require("./src/routers/index")
const connectDB = require("./src/config/configDb")

const PORT = process.env.PORT || 5050


app.use(bodyParser.json({ limit: 10000 }));
app.use(bodyParser.urlencoded({ extended: true, limit: 10000 }));
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser())
app.use(express.static("public"));
connectDB()
route(app)

if (cluster.isMaster) {
    for (var i = 0; i < cpuCount; i++) {
        cluster.fork();
    }
    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
} else {
    app.listen(PORT, () => {
        console.log("Server is running at port " + PORT);
    });
}

