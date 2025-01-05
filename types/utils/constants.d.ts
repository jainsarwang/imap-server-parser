export declare const ListFlags: Readonly<{
    Noselect: "\\Noselect";
    HasChildren: "\\HasChildren";
    HasNoChildren: "\\HasNoChildren";
    Noinferiors: "\\Noinferiors";
}>;
export declare const MailboxStatusFlags: Readonly<{
    Marked: "\\Marked";
    Unmarked: "\\Unmarked";
}>;
export declare const MailboxFlags: Readonly<{
    Inbox: "\\Inbox";
    All: "\\All";
    Drafts: "\\Drafts";
    Sent: "\\Sent";
    Trash: "\\Trash";
    Junk: "\\Junk";
    Flagged: "\\Flagged";
}>;
export declare const messageFlags: Readonly<{
    Seen: "\\Seen";
    Answered: "\\Answered";
    Flagged: "\\Flagged";
    Deleted: "\\Deleted";
    Draft: "\\Draft";
    Recent: "\\Recent";
}>;
export declare const AccesFlags: Readonly<{
    Subscribed: "\\Subscribed";
    Archive: "\\Archive";
}>;
export declare const Commands: Readonly<{
    initial: {
        STARTTLS: string;
        LOGIN: string;
        CAPABILITY: string;
    };
    postAuthentication: {
        LOGOUT: string;
        NOOP: string;
        IDLE: string;
        LIST: string;
        SELECT: string;
        EXAMINE: string;
        CREATE: string;
        DELETE: string;
        RENAME: string;
        LSUB: string;
        SUBSCRIBE: string;
        UNSUBSCRIBE: string;
    };
    mailbox: {
        SELECT: string;
        EXAMINE: string;
        CREATE: string;
        DELETE: string;
        RENAME: string;
        LIST: string;
        LSUB: string;
        SUBSCRIBE: string;
        UNSUBSCRIBE: string;
        CLOSE: string;
    };
}>;
