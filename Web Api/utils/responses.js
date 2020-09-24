const errorResponseMsg = (res, status, message, data) => res.status(status).json({
    status: 'error',
    message,
    data
  });
  
  const successResponseMsg = (res, status = 200, message, data) => res.status(status).json({
    status: 'success',
    message,
    data
  });
  
  const sessionSuccessResponseMsg = (res, status, message, token, user) => res.status(status || 200).json({
    status: 'success',
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
  