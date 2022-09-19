const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");

router.get("/get-all-service", serviceController.getAllService);
router.post("/add-new-service", serviceController.addNewService);
router.get("/get-service-tree", serviceController.getServiceTree);
router.get("/get-service-list", serviceController.getServiceList);
router.get("/check-deadlock/:id", serviceController.checkDeadlock);

module.exports = router;
