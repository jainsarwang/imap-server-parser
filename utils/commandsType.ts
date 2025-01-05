import { ListFlags, MailboxFlags } from "./constants";

export interface noopSuccessType {
	exists?: number;
	recent?: number;
	expunge?: number;
}

export interface listOfMailBox {
	flag: (typeof ListFlags)[keyof typeof ListFlags];
	mailbox: string;
	delimeter?: string;
}

export interface mailBoxData extends Omit<listOfMailBox, "flag"> {
	flag: ((typeof MailboxFlags)[keyof typeof MailboxFlags] | "\\*")[];
}

export interface SelectOrExamineSuccessType {
	flags: mailBoxData["flag"];
	exists: number;
	recent: number;
	uidValidity: number;
	uidNext?: number;
	permanentFlags?: string[] /* TODO Build permanent flags */;
}
export interface ParsedMessageRange {
	from: number | "*";
	to: number | "*";
}

export type ParsedMessageSet = (ParsedMessageRange | number | "*")[];

export interface StoreCommandData {
	type: "add" | "remove" | "replace";
	messageSet: ParsedMessageSet;
	flags: string[];
}

export interface StoreCommandSuccess {
	flags: string[];
	message: number;
}
