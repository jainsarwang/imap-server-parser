"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = void 0;
const errorResponse = (status, message, isCallable = true) => {
    return (session, tag, cb) => {
        const response = `${tag} ${status} ${message}`;
        if (isCallable)
            session.response(response, cb);
        else
            return response;
    };
};
exports.Errors = {
    invalidSyntax: errorResponse("BAD", "Invalid syntax."),
    noPermission: errorResponse("NO", "You do not have permission to access."),
    inUse: errorResponse("NO", "Mailbox is currently in use."),
    unknownCommand: errorResponse("BAD", "Unknown command."),
    unknownError: errorResponse("BAD", "Unknown error.", false),
    notExists: errorResponse("NO", "[NONEXISTENT] Mailbox does not exists."),
    alreadyExists: errorResponse("NO", "[ALREADYEXISTS] Mailbox already exists."),
    serverError: errorResponse("NO", "[SERVERERROR] Something went wrong."),
    quotaExceeds: errorResponse("NO", "[QUOTA] Mailbox quota exceeded."),
    notFound: errorResponse("NO", "[CANNOT] Invalid Mailbox Name."),
    noMailboxSelected: errorResponse("NO", "No mailbox selected."),
    alreadySubscribed: errorResponse("NO", "Mailbox already subscribed."),
    // messages
    invalidMessageSet: errorResponse("BAD", "Invalid message set syntax"),
    tryCreate: errorResponse("NO", "[TRYCREATE] Mailbox doesn't exist"),
    noMessage: errorResponse("NO", "such message"),
    invalidFlagMessageList: errorResponse("NO", "Invalid flag or message list"),
};
exports.default = Error;
