/**
 * This class extends the Error class and is used to create custom errors to interact with the API for custom responses.
 */
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode || 500;
        Error.captureStackTrace(this, this.constructor);
    }
}

export {CustomError};