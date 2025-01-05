import { DropArgument, Socket } from "net";
import { Capability } from "../classes/Capability";
import { Mailbox } from "../classes/Mailbox";
import {
	listOfMailBox,
	mailBoxData,
	noopSuccessType,
	ParsedMessageSet,
	SelectOrExamineSuccessType,
	StoreCommandData,
	StoreCommandSuccess,
} from "./commandsType";

import { Errors } from "./Error";
import { Message } from "../classes/Message";

export interface InterconnectionType {
	Capability?: Capability;
	Mailbox?: Mailbox;
	Message?: Message;
}

export interface OptionInterface {
	ssl?: {
		cert: Buffer;
		key: Buffer;
	};
	port: number;
	host?: string;
	allowStringOutput?: boolean;
	timeout?: number;
	maxConnections?: number;
}

export type CommandType = {
	tag: string;
	command: string;
	data: string[];
};

export interface SocketDataType {
	loginCredentials?: object;
	listOfMailBox?: listOfMailBox[];
	selectedMailboxInfo?: mailBoxData;
}

export interface ImapCallback {
	error: (data?: responseDataErrorType | string) => void;
	noop: (data: noopSuccessType | responseDataErrorType | string) => void;
	auth: ImapCallback["error"];
	logout: ImapCallback["error"];
	list: (data?: listOfMailBox[] | responseDataErrorType | string) => void;
	select: (data?: SelectOrExamineSuccessType | responseDataErrorType | string) => void;
	examine: ImapCallback["select"];
	create: ImapCallback["error"];
	delete: ImapCallback["create"];
	subscribe: ImapCallback["create"];
	unsubscribe: ImapCallback["create"];
	rename: ImapCallback["error"];
	close: ImapCallback["error"];
	expunge: ImapCallback["error"];
	copy: ImapCallback["error"];
	store: (data: StoreCommandSuccess[] | Parameters<ImapCallback["error"]>[0]) => void;
}

export interface ImapEmitter {
	listen: () => void;
	connect: (socket: Socket) => void;
	drop: (dropObject?: DropArgument) => void;
	servererror: (err: Error) => void;
	serverclose: () => void;
	error: (err: Error, socket: Socket) => void;
	close: (hadError: boolean, socket: Socket) => void;
	end: (socket: Socket) => void;
	data: (socket: Socket, stream: Buffer | string) => void;
	noop: (socket: Socket, mailboxInfo: mailBoxData | null, callback: ImapCallback["noop"]) => void;
	auth: (socket: Socket, authData: { username: string; password: string }, callback: ImapCallback["auth"]) => void;
	logout: (socket: Socket, callback: ImapCallback["logout"]) => void;
	list: (
		socket: Socket,
		requestedPathInfo: {
			reference_name: string;
			mailbox_name: string;
		},
		callback: ImapCallback["list"]
	) => void;
	select: (socket: Socket, permission: string[], callback: ImapCallback["select"]) => void;
	examine: (socket: Socket, permission: string[], callback: ImapCallback["examine"]) => void;
	create: (socket: Socket, mailboxName: string[], callback: ImapCallback["create"]) => void;
	delete: (socket: Socket, mailboxName: string[], callback: ImapCallback["delete"]) => void;
	subscribe: (socket: Socket, mailboxName: string[], callback: ImapCallback["subscribe"]) => void;
	unsubscribe: (socket: Socket, mailboxName: string[], callback: ImapCallback["unsubscribe"]) => void;
	rename: (socket: Socket, oldName: string, newName: string, callback: ImapCallback["rename"]) => void;
	closemailbox: (socket: Socket, callback: ImapCallback["close"]) => void;
	expunge: (socket: Socket, callback: ImapCallback["expunge"]) => void;
	copy: (socket: Socket, messages: ParsedMessageSet, destiation: string, callback: ImapCallback["copy"]) => void;
	store: (socket: Socket, data: StoreCommandData, callback: ImapCallback["store"]) => void;
	unhandledcommands: (socket: Socket, ...args: any[]) => void;
}

export interface responseDataErrorType {
	isError: boolean;
	type: keyof typeof Errors;
}
