const Service = require("../models/services")

class serviceController {
    getAllService = async (req, res) => {
        try {
            const services = await Service.find().select("serviceName").exec()

            const abc = await Service.find().populate({
                path: "requirement",
                select: "serviceDependencies",
                populate: {
                    select: "requirement",
                    path: "serviceDependencies",
                    populate: {
                        select: "serviceDependencies",
                        path: "requirement",
                        populate: {
                            select: "requirement",
                            path: "serviceDependencies",
                        }
                    }
                }
            }).select("requirement")

            res.status(200).json({ services, abc })
        } catch (err) {
            res.status(400).json({
                err: err.message
            })
        }
    }

    addNewService = async (req, res) => {
        try {
            const { serviceName, author, authorizedPerson, isPublic, version, endpointPublicUrl, endpointPrivateUrl, alertTo, nameBot, botEndpoint, domain, port, platform, serviceDependencies, database, infrastructure } = req.body
            const checkExist = await Service.findOne({ serviceName }).exec()
            if (checkExist) {
                res.status(200).json({ message: "Service actually existed" })
            } else {
                const listIdService = await Service.find({
                    serviceName: {
                        $in: serviceDependencies
                    }
                }).select("_id")
                const service = new Service({
                    serviceName,
                    author,
                    authorizedPerson,
                    isPublic: isPublic === "public" ? true : false,
                    version,
                    monitoring: {
                        endpointPublicUrl,
                        endpointPrivateUrl,
                        alertTo: alertTo ? alertTo.map(value => {
                            return {
                                name: value.name,
                                email: value.email,
                                phone: value.phone
                            }
                        }) : [],
                        alertBot: {
                            name: nameBot,
                            botEndpoint
                        }
                    },
                    requirement: {
                        domain,
                        port,
                        platform,
                        serviceDependencies: listIdService ? listIdService : [],
                        infrastructure: {
                            java: infrastructure && infrastructure.includes("java"),
                            mongodb: infrastructure && infrastructure.includes("mongodb"),
                            redis: infrastructure && infrastructure.includes("redis"),
                            hazelcast: infrastructure && infrastructure.includes("hazelcast"),
                            kafka: infrastructure && infrastructure.includes("kafka"),
                            elasticSearch: infrastructure && infrastructure.includes("elasticSearch"),
                            nodejs: infrastructure && infrastructure.includes("nodejs"),
                        },
                        database: {
                            mongodb: {
                                dbName: database
                            }
                        }
                    }
                })
                await service.save()
                res.status(200).json({ message: "Add-new-service", service })
            }
        } catch (err) {
            res.status(400).json({
                err: err.message
            })
        }

    }
}

module.exports = new serviceController()