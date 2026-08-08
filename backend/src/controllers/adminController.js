const userController = require("./userController");
const dashboardController = require("./dashboardController");

class AdminController {
    async getUsers(req, res, next) {
        return userController.listUsers(req, res, next);
    }

    async getSystemStats(req, res, next) {
        return dashboardController.getAdminDashboard(req, res, next);
    }
}

module.exports = new AdminController();
