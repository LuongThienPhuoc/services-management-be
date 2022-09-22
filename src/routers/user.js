const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")

router.get("/resgister", userController.resgister)
router.post("/login", userController.login)
router.get("/addEmail", userController.addEmail)
router.get("/get-all-user", userController.getAllMail)

module.exports = router
