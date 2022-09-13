const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LogSchema = new Schema(
    {
        time: { type: Number, required: true },
        reqID: { type: String, required: true },
        status: { type: Boolean, required: true },
    },
    { timestamps: true }
);

const Log = mongoose.model("logs", LogSchema);
module.exports = Log;
