const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServiceSchema = new Schema(
    {
        serviceName: { type: String, required: true },
        author: { type: String, required: true }, // Email
        authorizedPerson: { type: String, required: true }, // Email
        isPublic: { type: Boolean, default: false },
        version: { type: String, required: true },
        monitoring: {
            endpointPublicUrl: { type: String, required: true },
            endpointPrivateUrl: { type: String, required: false },
            alertTo: [
                {
                    name: { type: String, required: true },
                    email: { type: String, required: true },
                    phone: { type: String, required: true },
                }
            ],
            alertBot: {
                name: { type: String, required: true },
                botEndpoint: { type: String, required: true },
            }
        },
        requirement: {
            domain: { type: String, required: true },
            port: { type: Number, required: true },
            platform: { type: String, required: true },
            serviceDependencies: [
                {
                    serviceId: {
                        type: Schema.Types.ObjectID,
                        ref: "services",
                    },
                    listLog: [
                        {
                            type: Schema.Types.ObjectID,
                            ref: "logs"
                        }
                    ],
                    time: {
                        type: Number,
                        default: 0
                    }
                }
            ],
            infrastructure: {
                java: { type: Boolean, default: false },
                mongodb: { type: Boolean, default: false },
                redis: { type: Boolean, default: false },
                hazelcast: { type: Boolean, default: false },
                kafka: { type: Boolean, default: false },
                elasticSearch: { type: Boolean, default: false },
                nodejs: { type: Boolean, default: false }
            },
            database: {
                mongodb: {
                    dbName: { type: String, required: true },
                }
            }
        },
    },
    { timestamps: true }
);

const Service = mongoose.model("services", ServiceSchema);
module.exports = Service;
