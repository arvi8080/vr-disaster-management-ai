const { sendError } = require("../utils/response");
const { ERROR_CODES } = require("../utils/constants");

function validate(validatorFn) {
    return (req, res, next) => {
        const error = validatorFn(req);
        if (error) {
            return sendError(res, error, ERROR_CODES.BAD_REQUEST, 400);
        }
        next();
    };
}

module.exports = {
    validate
};

