const User = require("../models/user");

class userController {
  login = async (req, res) => {
    res.status(200).json({ message: "Login" });
  };
}

module.exports = new userController();
