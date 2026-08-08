function sendSuccess(res, data = null, message = null, statusCode = 200, pagination = null) {
    const response = {
        success: true
    };
    
    if (message) {
        response.message = message;
    }
    
    if (data !== null) {
        response.data = data;
    }

    if (pagination) {
        response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
}

function sendError(res, message, errorCode = "INTERNAL_SERVER_ERROR", statusCode = 500, details = null) {
    const response = {
        success: false,
        message,
        errorCode
    };

    if (details) {
        response.details = details;
    }

    return res.status(statusCode).json(response);
}

module.exports = {
    sendSuccess,
    sendError
};
