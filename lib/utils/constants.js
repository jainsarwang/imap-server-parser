"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = exports.AccesFlags = exports.messageFlags = exports.MailboxFlags = exports.MailboxStatusFlags = exports.ListFlags = void 0;
exports.ListFlags = Object.freeze({
    Noselect: "\\Noselect",
    HasChildren: "\\HasChildren",
    HasNoChildren: "\\HasNoChildren",
    Noinferiors: "\\Noinferiors",
});
exports.MailboxStatusFlags = Object.freeze({
    Marked: "\\Marked",
    Unmarked: "\\Unmarked",
});
exports.MailboxFlags = Object.freeze({
    Inbox: "\\Inbox",
    All: "\\All",
    Drafts: "\\Drafts",
    Sent: "\\Sent",
    Trash: "\\Trash",
    Junk: "\\Junk",
    Flagged: "\\Flagged",
});
exports.messageFlags = Object.freeze({
    Seen: "\\Seen",
    Answered: "\\Answered",
    Flagged: "\\Flagged",
    Deleted: "\\Deleted",
    Draft: "\\Draft",
    Recent: "\\Recent",
});
exports.AccesFlags = Object.freeze({
    Subscribed: "\\Subscribed",
    Archive: "\\Archive",
});
exports.Commands = Object.freeze({
    initial: {
        STARTTLS: "STARTTLS",
        LOGIN: "AUTH=PLAIN",
        CAPABILITY: "CAPABILITY",
    },
    postAuthentication: {
        LOGOUT: "LOGOUT",
        NOOP: "NOOP",
        IDLE: "IDLE",
        LIST: "LIST",
        SELECT: "SELECT",
        EXAMINE: "EXAMINE",
        CREATE: "CREATE",
        DELETE: "DELETE",
        RENAME: "RENAME",
        LSUB: "LSUB",
        SUBSCRIBE: "SUBSCRIBE",
        UNSUBSCRIBE: "UNSUBSCRIBE",
    },
    mailbox: {
        SELECT: "SELECT",
        EXAMINE: "EXAMINE",
        CREATE: "CREATE",
        DELETE: "DELETE",
        RENAME: "RENAME",
        LIST: "LIST",
        LSUB: "LSUB",
        SUBSCRIBE: "SUBSCRIBE",
        UNSUBSCRIBE: "UNSUBSCRIBE",
        CLOSE: "CLOSE",
    },
});
