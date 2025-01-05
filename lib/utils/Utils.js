"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwError = exports.successEventCallback = exports.errorEventCallback = void 0;
const Error_1 = require("./Error");
// if no data passed it is consider as success
const errorEventCallback = (session, { successResponse, tag, onSuccess }) => {
    return (data) => {
        if (!data) {
            successResponse.length > 0 && session.response(`${tag} OK ${successResponse}`);
            if (onSuccess)
                onSuccess();
            return;
        }
        if (typeof data == "string") {
            session.response(`${tag} NO ${data}`);
            return;
        }
        if ("isError" in data && data.isError) {
            if (!data.type) {
                (0, exports.throwError)(session.parent, "servererror", "Type property is mandatory in Error Callback function.");
                return;
            }
            Error_1.Errors[data.type]
                ? Error_1.Errors[data.type].apply(this, [session, tag])
                : (0, exports.throwError)(session.parent, "error", "Invalid type provided to response.", session.getSocket);
            return;
        }
    };
};
exports.errorEventCallback = errorEventCallback;
// if no data or string is passes it is error
const successEventCallback = (session, { defaultError, tag, successResponse, processSuccessResponseData }) => {
    return (data) => {
        if (!data) {
            defaultError(session, tag);
            return;
        }
        if (typeof data == "string") {
            session.response(`${tag} NO ${data}`);
            return;
        }
        if (typeof data == "object" && "isError" in data && data.isError) {
            if (!("type" in data)) {
                (0, exports.throwError)(session.parent, "servererror", "Type property is mandatory in Error Callback function.");
                return;
            }
            data.type in Error_1.Errors
                ? Error_1.Errors[data.type].apply(this, [session, tag])
                : (0, exports.throwError)(session.parent, "error", "Invalid type provided to response.", session.getSocket);
            return;
        }
        // success
        const finalArr = [];
        /*
        if (Array.isArray(data)) finalArr.push(...processSuccessResponseData(data));
        else finalArr.push(processSuccessResponseData(data)); */
        finalArr.push(...processSuccessResponseData(data));
        for (const i of finalArr) {
            session.response(i);
        }
        session.response(`${tag} OK ${successResponse}`);
    };
};
exports.successEventCallback = successEventCallback;
// throw error if error listener is not describe
const throwError = (emitter, event, error, ...args) => {
    const err = new Error(error);
    if (!emitter.emit(event, err, ...args))
        throw err;
};
exports.throwError = throwError;
