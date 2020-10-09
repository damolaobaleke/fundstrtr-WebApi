//Send a json error message based on the status error(5XX OR 4XX)
const errorResponseMsg = (res, success, message, data) => res.status(success).json({
    success: false, //error (400)
    message,
    data //from db pitches , users , etc...
});

const successResponseMsg = function(res, success, message, data) {
    res.status(success).json({
        success: true, //status = success(200)
        message,
        data
    });
}

const sessionSuccessResponseMsg = (res, success, message, token, user) => res.status(success || 200).json({
    success: true,
    message,
    data: {
        authenticated: true,
        token,
        user
    }
});

module.exports.errorResponseMsg = errorResponseMsg;
module.exports.successResponseMsg = successResponseMsg;
module.exports.sessionSuccessResponseMsg = sessionSuccessResponseMsg;