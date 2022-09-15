const express = require("express")
const router = express.Router()
const serviceController = require("../controllers/serviceController")

router.get("/get-all-service", serviceController.getAllService)
router.post("/add-new-service", serviceController.addNewService)

module.exports = router
