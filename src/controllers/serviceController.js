const e = require("express");
const Service = require("../models/services")

class serviceController {

    checkDeadlock = async (req, res) => {
        try {
            const { id } = req.params;
            const services = await Service.find().select("serviceName requirement.ownDependencies").exec()
            const recursive = (listDepen) => {
                if (listDepen?.length === 0 || listDepen === undefined) {
                    return []
                }
                return listDepen.map(depen => {
                    let filter = services.find(value => String(value._id) === String(depen))
                    return {
                        id: depen,
                        name: filter.serviceName,
                        list: recursive(filter?.requirement?.ownDependencies)
                    }
                })
            }
            const service = await Service.findById(id.trim())
            const serviceReturn = {
                id: service._id,
                name: service.serviceName,
                list: recursive(service.requirement.ownDependencies)
            }

            serviceReturn.list[0].list[0].list.push({
                id: service._id,
                name: service.serviceName,
                list: []
            })

            const checkValid = (service, key) => {
                if (service.name === key) {
                    return false
                }
                if (service.list.length === 0) {
                    return true
                }
                for (let i = 0; i < service.list.length; i++) {
                    if (!checkValid(service.list[i], key)) return false
                }
                return true;
            }

            const checkDeadlock = (serviceChild, key) => {
                for (let i = 0; i < serviceChild.length; i++) {
                    if (!checkValid(serviceChild[i], key)) return true
                }
                return false
            }
            console.log(checkDeadlock(serviceReturn.list, serviceReturn.name))

            res.status(200).json({
                message: "Thành công",
                serviceReturn
            })
        } catch (err) {
            res.status(400).json({
                err: err.message
            })
        }

    }

    getAllService = async (req, res) => {
        try {
            const services = await Service.find().select("serviceName requirement.serviceDependencies").exec()

            res.status(200).json({ services })
        } catch (err) {
            res.status(400).json({
                err: err.message
            })
        }
    }

    addNewService = async (req, res) => {
        // try {
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
                    ownDependencies: [],
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
            console.log(service._id)
            for (let i = 0; i < serviceDependencies.length; i++) {
                console.log(serviceDependencies[i])
                await Service.findOneAndUpdate(
                    {
                        serviceName: serviceDependencies[i],
                    },
                    {
                        $push: { "requirement.ownDependencies": [service._id] }
                    }
                )
            }
            res.status(200).json({ message: "Add-new-service", service })
        }
        // } catch (err) {
        //     res.status(400).json({
        //         err: err.message
        //     })
        // }

    }
}

module.exports = new serviceController()