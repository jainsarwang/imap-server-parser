import { Socket } from "net";
import { IMAP } from "../IMAP";

import tls from "tls";
import * as Utils from "../utils/Utils";
import { Commands } from "../utils/constants";
import type { CommandType, ImapCallback, InterconnectionType, OptionInterface, SocketDataType } from "../utils/types";
import { Errors } from "../utils/Error";

class Session {
	private socket;
	private options;
	public interconnection: InterconnectionType;
	public parent;
	public socketData: SocketDataType;

	constructor(parent: IMAP, socket: Socket, options: OptionInterface) {
		this.interconnection = {};
		this.parent = parent;
		this.socket = socket;
		this.options = options;
		this.socketData = {};

		this.defaultSocketConfiguration();

		this.response(`* OK IMAP4rev1 server ready`);
	}

	get getSocket() {
		return this.socket;
	}

	get getOptions() {
		return this.options;
	}

	public updateSocket(newSocket: Socket) {
		this.socket = newSocket;
	}

	public startTLS(commands: CommandType) {
		if (this.options.ssl) {
			// socket.response("* OK Begin TLS negotiation now");
			this.response(`${commands.tag} OK STARTTLS completed`, () => {
				this.upgradeToTLS();
				// this.socket = this.upgradeToTLS();
			});
		} else {
			this.response(`${commands.tag} NO STARTTLS not supported`);
		}
	}

	private upgradeToTLS() {
		if (this.options.ssl) {
			const { cert, key } = this.options.ssl;
			if (!cert || !key) {
				this.parent.emit("error", new Error("Cert and key is required"), this.socket);
			}

			// creating secure socket
			const secureSocket = new tls.TLSSocket(this.socket, {
				cert,
				key,
				isServer: true,
			});

			// transferring listeners
			const eventNames = this.socket.eventNames();
			for (const event of eventNames) {
				if (event === "secureConnect") continue;

				const listeners: Function[] = this.socket.listeners(event);

				for (const listener of listeners) {
					secureSocket.on(event as string, listener.bind(this.socket));
				}
			}

			secureSocket.on("secureConnect", () => {
				secureSocket.write(`* OK IMAP4rev1 TLS ready\r\n`);
			});

			this.defaultSocketConfiguration(secureSocket);

			this.socket = secureSocket;
		}
	}

	public login(commands: CommandType) {
		if (commands.data.length != 2) {
			// invalid no of arguments
			Errors.invalidSyntax(this, commands.tag);
			return;
		}

		const authData = { username: commands.data[0], password: commands.data[1] };

		this.parent.emit(
			"auth",
			this.socket,
			authData,
			Utils.errorEventCallback(this, {
				tag: commands.tag,
				successResponse: `LOGIN completed.`,
				onSuccess: () => {
					// storing auth for future use
					this.socketData.loginCredentials = authData;

					// adding supported commands
					this.interconnection.Capability?.addCommands(...Object.values<string>(Commands.postAuthentication));
				},
			})
		);
	}

	public logout(commands: CommandType) {
		this.parent.emit(
			"logout",
			this.socket,
			Utils.errorEventCallback(this, {
				tag: commands.tag,
				successResponse: ``,
				onSuccess: () => {
					this.response("* BYE IMAP4rev1 server logging out.");
					this.response(`${commands.tag} OK LOGOUT Completed`);
					this.socket.end();
				},
			})
		);
	}

	public response(string: string, cb?: any) {
		this.socket.write(`${string}\r\n`, cb);

		return this;
	}

	private defaultSocketConfiguration(socket?: Socket) {
		let soc = this.socket;
		if (socket) {
			soc = socket;
		}

		this.options.allowStringOutput && soc.setEncoding("utf8");
		// socket.setNoDelay(true);
		// socket.setKeepAlive(true, 60000);
		// soc.timeout = this.options.timeout;
	}
}

export { Session };
