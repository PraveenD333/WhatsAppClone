
export const successresponse = (res, message,statuscode = 200,data = {}) => {
    return res.status(statuscode).json({ success: true, message, data })
}

export const errorresponse = (res, message, statuscode = 500, error = null) => {
    return res.status(statuscode).json({ success: false, message, error: error ? error.toString() : undefined })
}