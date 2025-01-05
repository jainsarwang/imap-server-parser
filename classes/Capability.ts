import { CommandType, ImapCallback } from "../utils/types";
import { Session } from "./Session";

import { Commands } from "../utils/constants";
import * as Utils from "../utils/Utils";
import { Errors } from "../utils/Error";
import { noopSuccessType } from "../utils/commandsType";

class Capability {
	private session;
	private parent;
	private supportedCommands: Set<string> = new Set();
	private socket;

	constructor(session: Session) {
		session.interconnection.Capability = this;

		// initialization
		this.session = session;
		this.parent = session.parent;
		this.socket = session.getSocket;

		// initial commands
		this.addCommands(...Object.values<string>(Commands.initial));
		if (!session.getOptions.ssl) this.removeCommands("STARTTLS");
	}

	public capability(commands: CommandType) {
		this.session.response(`* CAPABILITY IMAP4rev1 ${this.getCommandsAsString}`);
		this.session.response(`${commands.tag} OK CAPABILITY completed`);
	}

	public noop(commands: CommandType) {
		const successResponse = "NOOP completed.";

		this.parent.emit(
			"noop",
			this.session.getSocket,
			this.session.socketData.selectedMailboxInfo ?? null,
			Utils.successEventCallback(this.session, {
				tag: commands.tag,
				defaultError: Errors.serverError,
				successResponse,
				processSuccessResponseData: (data: Parameters<ImapCallback["noop"]>[0]) => {
					if (typeof data != "object" || "isError" in data) {
						return;
					}

					const response: string[] = [];

					data.exists && response.push(`* ${data.exists} EXISTS`);
					data.recent && response.push(`* ${data.recent} RECENT`);
					data.expunge && response.push(`* ${data.exists} EXPUNGE`);

					return response;
				},
			})
		) || this.session.response(`${commands.tag} OK ${successResponse}`);
	}

	public addCommands(...commands: string[]) {
		commands.forEach((e) => this.supportedCommands.add(e));
		// this.supportedCommands.add(...commands);
	}

	isAllowed(command: string): boolean {
		return this.supportedCommands.has(command);
	}

	get getCommands() {
		return Array(...this.supportedCommands);
	}

	removeCommands(command: string) {
		this.supportedCommands.delete(command);
	}

	get getCommandsAsString() {
		return this.getCommands.join(" ");
	}
}

export { Capability };
