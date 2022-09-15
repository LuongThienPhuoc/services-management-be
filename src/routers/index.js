const userRoute = require("./user")
const serviceRoute = require("./service")

function route(app) {
    app.use("/api/v1/service", serviceRoute)
    app.use("/api/v1/user", userRoute)
}

module.exports = route