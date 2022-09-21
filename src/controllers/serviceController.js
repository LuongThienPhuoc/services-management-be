const { findOneAndDelete } = require("../models/services");
const Service = require("../models/services");

class serviceController {
  deleteService = async (req, res) => {
    try {
      const { id } = req.params;
      const service = await Service.findById(id)
        .populate("requirement.serviceDependencies", "serviceName")
        .populate("requirement.ownDependencies", "serviceName")
        .exec();
      for (let i = 0; i < service.requirement.ownDependencies.length; i++) {
        await Service.findOneAndUpdate(
          {
            serviceName: service.requirement.ownDependencies[i].serviceName,
          },
          {
            $pull: { "requirement.serviceDependencies": service._id },
          }
        );
      }

      for (let i = 0; i < service.requirement.serviceDependencies.length; i++) {
        console.log(service.requirement.serviceDependencies[i].serviceName);
        await Service.findOneAndUpdate(
          {
            serviceName: service.requirement.serviceDependencies[0].serviceName,
          },
          {
            $pull: { "requirement.ownDependencies": service._id },
          }
        );
      }
      await Service.findOneAndDelete({ _id: id });
      const services = await Service.find().exec();
      res.status(200).json({
        message: "Thành công",
        services,
      });
    } catch (err) {
      res.status(400).json({
        err: err.message,
      });
    }
  };

  checkDeadlock = async (req, res) => {
    try {
      // Get giá trị
      const { id } = req.params;
      const services = await Service.find()
        .populate({
          path: "requirement.ownDependencies",
          select: "serviceName",
        })
        .exec();

      // Đệ quy lấy giá trị cây
      const recursive = (listDepen) => {
        if (listDepen?.length === 0 || listDepen === undefined) {
          return [];
        }
        return listDepen.map((depen) => {
          let filter = services.find(
            (value) => String(value._id) === String(depen)
          );
          return {
            id: depen,
            name: filter.serviceName,
            list: recursive(filter?.requirement?.ownDependencies),
          };
        });
      };
      const service = await Service.findById(id.trim());
      const serviceReturn = {
        id: service._id,
        name: service.serviceName,
        list: recursive(service.requirement.ownDependencies),
      };
      serviceReturn.list[0].list[0].list.push({
        id: service._id,
        name: service.serviceName,
        list: [],
      });

      // Check deadlock
      const checkValid = (service, key) => {
        if (service.name === key) {
          return false;
        }
        if (service.list.length === 0) {
          return true;
        }
        for (let i = 0; i < service.list.length; i++) {
          if (!checkValid(service.list[i], key)) return false;
        }
        return true;
      };
      const checkDeadlock = (serviceChild, key) => {
        for (let i = 0; i < serviceChild.length; i++) {
          if (!checkValid(serviceChild[i], key)) return true;
        }
        return false;
      };
      console.log(checkDeadlock(serviceReturn.list, serviceReturn.name));

      res.status(200).json({
        message: "Thành công",
        serviceReturn,
      });
    } catch (err) {
      res.status(400).json({
        err: err.message,
      });
    }
  };

  editService = async (req, res) => {
    try {
      // Lấy giá trị
      const { id } = req.params;
      const {
        serviceName,
        author,
        authorizedPerson,
        isPublic,
        version,
        endpointPublicUrl,
        endpointPrivateUrl,
        alertTo,
        nameBot,
        botEndpoint,
        domain,
        port,
        platform,
        serviceDependencies,
        database,
        infrastructure,
      } = req.body;
      const services = await Service.find().exec();

      //Đệ quy lấy giá trị cây
      const recursive = (listDepen) => {
        if (listDepen?.length === 0 || listDepen === undefined) {
          return [];
        }
        return listDepen.map((depen) => {
          let filter = services.find(
            (value) => String(value._id) === String(depen)
          );
          return {
            id: depen,
            name: filter.serviceName,
            list: recursive(filter?.requirement?.ownDependencies),
          };
        });
      };
      const service = await Service.findOne({ _id: id });
      const serviceReturn = {
        id: service._id,
        name: service.serviceName,
        list: recursive(service.requirement.ownDependencies),
      };

      // Check deadlock
      const checkValid = (service, key) => {
        if (service.name === key) {
          return false;
        }
        if (service.list.length === 0) {
          return true;
        }
        for (let i = 0; i < service.list.length; i++) {
          if (!checkValid(service.list[i], key)) return false;
        }
        return true;
      };

      const checkDeadlock = (serviceChild, key) => {
        for (let i = 0; i < serviceChild.length; i++) {
          if (!checkValid(serviceChild[i], key)) return true;
        }
        return false;
      };

      const deadlock = [];
      const ownDependencies = [];
      let isSuccess = true;

      const currentService = services.find(
        (value) => String(value._id) === String(id)
      );

      for (
        let i = 0;
        i < currentService.requirement.ownDependencies.length;
        i++
      ) {
        const serviceTempo = await Service.findById(
          currentService.requirement.ownDependencies[i]
        ).select("serviceName");
        ownDependencies.push(serviceTempo.serviceName);
      }

      // Lấy deadlock
      serviceDependencies.forEach((name) => {
        if (ownDependencies.includes(name)) {
          deadlock.push({
            serviceName: name,
            deadlock: true,
          });
          isSuccess = false;
        } else {
          if (checkDeadlock(serviceReturn.list, name)) {
            deadlock.push({
              serviceName: name,
              deadlock: true,
            });
            isSuccess = false;
          } else {
            deadlock.push({
              serviceName: name,
              deadlock: false,
            });
          }
        }
      });

      const update = async () => {
        const serviceNameList = await Service.find({
          _id: { $in: service.requirement.serviceDependencies },
        })
          .select("serviceName")
          .exec();
        console.log(serviceNameList);
        console.log(serviceDependencies);

        for (let i = 0; i < serviceDependencies.length; i++) {
          let check = serviceNameList.find((value) => {
            if (value.serviceName === serviceDependencies[i]) {
              return value;
            }
          });
          if (!check) {
            console.log("Thêm service mới");
            console.log(check);
            await Service.findOneAndUpdate(
              {
                serviceName: serviceDependencies[i],
              },
              {
                $push: { "requirement.ownDependencies": service._id },
              }
            );
          }
        }

        for (let i = 0; i < serviceNameList.length; i++) {
          if (!serviceDependencies.includes(serviceNameList[i].serviceName)) {
            console.log(serviceNameList[i]._id);
            await Service.findOneAndUpdate(
              {
                serviceName: serviceNameList[i].serviceName,
              },
              {
                $pull: { "requirement.ownDependencies": service._id },
              }
            );
          }
        }

        const listIdService = await Service.find({
          serviceName: {
            $in: serviceDependencies,
          },
        }).select("_id");

        let updateService = await Service.findOneAndUpdate(
          { _id: id },
          {
            serviceName,
            author,
            authorizedPerson,
            isPublic: isPublic === "public" ? true : false,
            version,
            monitoring: {
              endpointPublicUrl,
              endpointPrivateUrl,
              alertTo: alertTo
                ? alertTo.map((value) => {
                    return {
                      name: value.name,
                      email: value.email,
                      phone: value.phone,
                    };
                  })
                : [],
              alertBot: {
                name: nameBot,
                botEndpoint,
              },
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
                hazelcast:
                  infrastructure && infrastructure.includes("hazelcast"),
                kafka: infrastructure && infrastructure.includes("kafka"),
                elasticSearch:
                  infrastructure && infrastructure.includes("elasticSearch"),
                nodejs: infrastructure && infrastructure.includes("nodejs"),
              },
              database: {
                mongodb: {
                  dbName: database,
                },
              },
            },
          }
        );
        res.status(200).json({
          message: "Edit thành công",
          service: updateService,
        });
      };

      // Edit service
      if (isSuccess) {
        if (service.serviceName === serviceName) {
          update();
        } else {
          const check = await Service.findOne({ serviceName });
          if (!check) {
            update();
          } else {
            res.status(200).json({
              message: "Tên service tồn tại!",
              status: 0,
            });
          }
        }
      } else {
        res.status(200).json({
          status: 0,
          deadlock,
        });
      }
    } catch (err) {
      res.status(400).json({
        err: err.message,
      });
    }
  };

  getService = async (req, res) => {
    try {
      const { id } = req.params;
      const service = await Service.findOne({ _id: id })
        .populate("requirement.serviceDependencies", "serviceName")
        .populate("requirement.ownDependencies", "serviceName")
        .exec();
      res.status(200).json({
        service,
      });
    } catch (err) {
      res.status(400).json({
        err: err.message,
      });
    }
  };

  getAllService = async (req, res) => {
    try {
      const services = await Service.find()
        .select("serviceName requirement.serviceDependencies")
        .exec();

      res.status(200).json({ services });
    } catch (err) {
      res.status(400).json({
        err: err.message,
      });
    }
  };

  addNewService = async (req, res) => {
    try {
      const {
        serviceName,
        author,
        authorizedPerson,
        isPublic,
        version,
        endpointPublicUrl,
        endpointPrivateUrl,
        alertTo,
        nameBot,
        botEndpoint,
        domain,
        port,
        platform,
        serviceDependencies,
        database,
        infrastructure,
      } = req.body;
      const checkExist = await Service.findOne({ serviceName }).exec();
      if (checkExist) {
        res
          .status(200)
          .json({ message: "Service actually existed", status: 0 });
      } else {
        const listIdService = await Service.find({
          serviceName: {
            $in: serviceDependencies,
          },
        }).select("_id");
        const service = new Service({
          serviceName,
          author,
          authorizedPerson,
          isPublic: isPublic === "public" ? true : false,
          version,
          monitoring: {
            endpointPublicUrl,
            endpointPrivateUrl,
            alertTo: alertTo
              ? alertTo.map((value) => {
                  return {
                    name: value.name,
                    email: value.email,
                    phone: value.phone,
                  };
                })
              : [],
            alertBot: {
              name: nameBot,
              botEndpoint,
            },
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
              elasticSearch:
                infrastructure && infrastructure.includes("elasticSearch"),
              nodejs: infrastructure && infrastructure.includes("nodejs"),
            },
            database: {
              mongodb: {
                dbName: database,
              },
            },
          },
        });
        await service.save();
        console.log(service._id);
        for (let i = 0; i < serviceDependencies.length; i++) {
          console.log(serviceDependencies[i]);
          await Service.findOneAndUpdate(
            {
              serviceName: serviceDependencies[i],
            },
            {
              $push: { "requirement.ownDependencies": [service._id] },
            }
          );
        }
        res.status(200).json({ message: "Add-new-service", service });
      }
    } catch (err) {
      res.status(400).json({
        err: err.message,
      });
    }
  };

  getServiceTree = async (req, res) => {
    // console.log(req.query);
    // console.log(req.query.id);
    let allServices = await Service.find();
    // console.log("allServices", allServices);
    let objectList = {};
    let objectInfo = {};
    for (let i = 0; i < allServices.length; i++) {
      objectList[allServices[i]._id] = allServices[
        i
      ].requirement.serviceDependencies.map((value) => value.toString());
      objectInfo[allServices[i]._id] = {
        _id: allServices[i]._id,
        name: allServices[i].serviceName,
      };
    }

    console.log("objectList", objectList);
    console.log("objectInfo", objectInfo);
    let objectTree = {};
    objectTree = {
      ...objectInfo[req.query._id],
    };

    let findDependences = (serviceID) => {
      //   console.log("serviceID", serviceID);
      //   console.log("objectList[serviceID]", objectList[serviceID]);
      if (!objectList[serviceID]) return [];
      else {
        let result = [];
        objectList[serviceID].forEach((value) => {
          result.push({
            dependences: findDependences(value),
            ...objectInfo[value],
          });
        });
        return result;
      }
    };

    const depen = findDependences(req.query.id);
    // console.log("objectList", objectList);
    res.status(200).send({
      success: true,
      depen: depen,
      current: objectInfo[req.query.id],
    });
  };

  getServiceList = async (req, res) => {
    Service.find()
      // .populate("requirement.serviceDependencies", "serviceName")
      // .populate("requirement.ownDependencies", "serviceName")
      .exec()
      .then((data) => {
        res.status(200).send({ success: true, services: data });
      })
      .catch((err) => {
        res.status(204).send({ success: false, services: data });
      });
  };
  getTree = async (req, res) => {
    const { id } = req.params;
    const services = await Service.find().exec();

    //Đệ quy lấy giá trị cây
    const recursive = (listDepen) => {
      if (listDepen?.length === 0 || listDepen === undefined) {
        return null;
      }
      return listDepen.map((depen) => {
        let filter = services.find(
          (value) => String(value._id) === String(depen)
        );
        return {
          id: depen,
          name: filter.serviceName,
          children: recursive(filter?.requirement?.ownDependencies),
        };
      });
    };
    const service = await Service.findOne({ _id: id });
    const serviceReturn = {
      id: service._id,
      name: service.serviceName,
      children: recursive(service.requirement.ownDependencies),
    };

    res.status(200).json({
      tree: serviceReturn,
    });
  };
}

module.exports = new serviceController();
