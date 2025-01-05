import { Socket } from "net";
import { Session } from "./Session";
import { IMAP } from "../IMAP";

import { ListFlags } from "../utils/constants";
import * as Utils from "../utils/Utils";
import { CommandType, ImapCallback, SocketDataType } from "../utils/types";
import { Errors } from "../utils/Error";

class Mailbox {
	private session: Session;
	private parent: IMAP;

	constructor(session: Session) {
		session.interconnection.Mailbox = this;

		// initialization
		this.session = session;
		this.parent = session.parent;
	}

	list(commands: CommandType) {
		if (commands.data.length != 2) {
			Errors.invalidSyntax(this.session, commands.tag);
			return;
		}

		this.parent.emit(
			"list",
			this.session.getSocket,
			{
				reference_name: commands.data[0],
				mailbox_name: commands.data[1],
			},
			Utils.successEventCallback(this.session, {
				tag: commands.tag,
				defaultError: Errors.serverError,
				successResponse: "LIST completed",
				processSuccessResponseData: (data: Parameters<ImapCallback["auth"]>[0]) => {
					if (!Array.isArray(data)) {
						Utils.throwError(this.parent, "servererror", "Respose data must be of type Array");
						return;
					}

					// TODO: Add add mailbox available to listOfMailBox
					// this.session.socketData.listOfMailBox = data;

					return data.map(
						(d) =>
							`* LIST (${d.flag ?? ListFlags.HasNoChildren}) "${d.delimeter ?? "/"}" "${d.mailbox ?? ""}"`
					);
				},
			})
		);
	}

	select(commands: CommandType, permission: string[]) {
		if (commands.data.length != 1) {
			Errors.invalidSyntax(this.session, commands.tag);
			return;
		}

		const command = commands.command.toLowerCase() as "select" | "examine";

		this.parent.emit(
			command,
			this.session.getSocket,
			permission,
			Utils.successEventCallback(this.session, {
				tag: commands.tag,
				defaultError: Errors.serverError,
				successResponse: `[${
					command == "select" ? "READ-WRITE" : "READ-ONLY"
				}] ${command.toUpperCase()} completed.`,
				processSuccessResponseData: (data: Parameters<ImapCallback[typeof command]>[0]) => {
					if (typeof data != "object" || !("exists" in data)) {
						Utils.throwError(this.parent, "error", "Exists is mandatory.");
						return;
					}

					const response: string[] = [];

					data.flags && data.flags.length > 0 && response.push(`* FLAGS (${data.flags.join(" ")})`);

					response.push(`* ${data.exists ?? 0} EXISTS`);

					data.recent && response.push(`* ${data.recent} RECENT`);

					data.uidValidity && response.push(`* OK [UIDVALIDITY ${data.uidValidity}] UIDs valid`);

					data.permanentFlags &&
						data.permanentFlags.length > 0 &&
						response.push(
							`* OK [PERMANENTFLAGS (${
								command == "examine" ? "" : data.permanentFlags.join(" ")
							})] Flags allowed`
						);

					data.uidNext && response.push(`* OK [UIDNEXT ${data.uidNext}] Predicted next UID`);

					// storing select mailbox
					this.session.socketData.selectedMailboxInfo = {
						flag: data.flags,
						mailbox: commands.data.join(" "),
					};

					// add

					return response;
				},
			})
		);
	}

	createDeleteSubscribeUnsubscribe(commands: CommandType) {
		if (commands.data.length != 1) {
			Errors.invalidSyntax(this.session, commands.tag);
			return;
		}

		const command = commands.command.toLowerCase() as "create" | "delete" | "subscribe" | "unsubscribe";

		this.parent.emit(
			command,
			this.session.getSocket,
			commands.data,
			Utils.errorEventCallback(this.session, {
				tag: commands.tag,
				successResponse: `${command.toUpperCase()} completed.`,
				onSuccess: () => {
					// TODO: Add or remove mailbox from listOfMailBox
				},
			})
		);
	}

	rename(commands: CommandType) {
		if (commands.data.length != 2) {
			Errors.invalidSyntax(this.session, commands.tag);
			return;
		}

		this.parent.emit(
			"rename",
			this.session.getSocket,
			commands.data[0],
			commands.data[1],
			Utils.errorEventCallback(this.session, {
				tag: commands.tag,
				successResponse: "RENAME completed.",
			})
		);
	}

	close(commands: CommandType) {
		if (!this.session.socketData.selectedMailboxInfo) {
			Errors.noMailboxSelected(this.session, commands.tag);
			return;
		}

		this.parent.emit(
			"closemailbox",
			this.session.getSocket,
			Utils.errorEventCallback(this.session, {
				tag: commands.tag,
				successResponse: "CLOSE Completed.",
				onSuccess: () => {
					this.session.socketData.selectedMailboxInfo = undefined;
				},
			})
		);
	}
}

export { Mailbox };
