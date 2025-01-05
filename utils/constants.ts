export const ListFlags = Object.freeze({
	Noselect: "\\Noselect",
	HasChildren: "\\HasChildren",
	HasNoChildren: "\\HasNoChildren",
	Noinferiors: "\\Noinferiors",
});

export const MailboxStatusFlags = Object.freeze({
	Marked: "\\Marked",
	Unmarked: "\\Unmarked",
});

export const MailboxFlags = Object.freeze({
	Inbox: "\\Inbox",
	All: "\\All",
	Drafts: "\\Drafts",
	Sent: "\\Sent",
	Trash: "\\Trash",
	Junk: "\\Junk",
	Flagged: "\\Flagged",
});

export const messageFlags = Object.freeze({
	Seen: "\\Seen",
	Answered: "\\Answered",
	Flagged: "\\Flagged",
	Deleted: "\\Deleted",
	Draft: "\\Draft",
	Recent: "\\Recent",
});

export const AccesFlags = Object.freeze({
	Subscribed: "\\Subscribed",
	Archive: "\\Archive",
});

export const Commands = Object.freeze({
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
