import { IMAP } from "../IMAP";
import { Errors } from "../utils/Error";
import { CommandType, ImapCallback } from "../utils/types";
import * as Utils from "../utils/Utils";
import { Session } from "./Session";
import { ParsedMessageSet, StoreCommandData } from "../utils/commandsType";

class Message {
	private session: Session;
	private parent: IMAP;

	constructor(session: Session) {
		session.interconnection.Message = this;

		// initialization
		this.session = session;
		this.parent = session.parent;
	}

	isAccessible(tag: string) {
		if (this.session.socketData.selectedMailboxInfo) return true;

		Errors.noMailboxSelected(this.session, tag);
		return false;
	}

	expunge(commands: CommandType) {
		if (!this.isAccessible(commands.tag)) return;

		this.parent.emit(
			"expunge",
			this.session.getSocket,
			Utils.errorEventCallback(this.session, {
				tag: commands.tag,
				successResponse: "EXPUNGE completed.",
			})
		);
	}

	copy(commands: CommandType) {
		if (commands.data.length != 2) {
			Errors.invalidSyntax(this.session, commands.tag);
			return;
		}

		const parsedMessageSet = this.parseMessageSet(commands.data[0], commands.tag);
		if (parsedMessageSet) {
			this.parent.emit(
				"copy",
				this.session.getSocket,
				parsedMessageSet,
				commands.data[1],
				Utils.errorEventCallback(this.session, {
					tag: commands.tag,
					successResponse: `[COPYUID] COPY completed`,
				})
			);
		}
	}

	store(commands: CommandType) {
		if (commands.data.length < 3) {
			Errors.invalidSyntax(this.session, commands.tag);
			return;
		}

		const [messageSet, flagType, ...flagsArr] = commands.data;

		const flagsStr = flagsArr.join(" "),
			parsedMessageSet = this.parseMessageSet(messageSet, commands.tag),
			type = flagType.match(/^((?<add>\+)|(?<remove>-))?FLAGS$/),
			flags = flagsStr.match(/^\((.+)\)$/);

		if (parsedMessageSet == null || flags == null || type == null || type.groups == undefined) {
			Errors.invalidSyntax(this.session, commands.tag);
			return;
		}

		const data: StoreCommandData = {
			type: type.groups.add ? "add" : type.groups.remove ? "remove" : "replace",
			messageSet: parsedMessageSet,
			flags: flags[1].split(" "),
		};

		this.parent.emit(
			"store",
			this.session.getSocket,
			data,
			Utils.successEventCallback(this.session, {
				tag: commands.tag,
				defaultError: Errors.serverError,
				successResponse: "STORE completed",
				processSuccessResponseData: (data: Parameters<ImapCallback["store"]>[0]) => {
					if (!Array.isArray(data)) {
						return;
					}

					return data.map((item) => `* ${item.message} FETCH (FLAGS (${item.flags.join(" ")}))`);
				},
			})
		);
	}

	/**
	 * 
	*/
	private parseMessageSet(messageSet: string, tag: string): ParsedMessageSet | null {
		const result: ParsedMessageSet = [];
		let isError = false;

		messageSet.split(",").forEach((seq) => {
			const rangeMatch = seq.match(/^(?<from>\d+|\*):(?<to>\d+|\*)$/);
			var from: any = 0,
				to: any = 0;

			if (rangeMatch && rangeMatch.groups) {
				from = rangeMatch.groups.from;
				to = rangeMatch.groups.to;
			}

			if (
				seq.includes(":") &&
				rangeMatch &&
				rangeMatch.groups &&
				(from == "*" || to == "*" || Number(from) <= Number(to))
			) {
				result.push({
					from: from == "*" ? "*" : Number(from),
					to: to == "*" ? "*" : Number(to),
				});
			} else if (seq.match(/^\d+|\*$/)) {
				result.push(seq == "*" ? seq : Number(seq));
			} else {
				Errors.invalidMessageSet(this.session, tag);
				isError = true;
				return;
			}
		});

		return isError ? null : result;
	}
}

export { Message };
