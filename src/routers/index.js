const userRoute = require("./user")


function route(app) {
    app.use("/api/v1/user", userRoute)
}

module.exports = route