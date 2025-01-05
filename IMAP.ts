import { Socket, createServer } from "net";
import { ImapEmitter, OptionInterface } from "./utils/types";

import EventEmitter from "events";
import { Session } from "./classes/Session";
import { Capability } from "./classes/Capability";
import { Mailbox } from "./classes/Mailbox";
import { Errors } from "./utils/Error";
import { Message } from "./classes/Message";

class IMAP extends EventEmitter {
	private server;

	on<K extends keyof ImapEmitter>(event: K, listener: ImapEmitter[K]): this {
		return super.on(event, listener);
	}

	emit<K extends keyof ImapEmitter>(event: K, ...args: Parameters<ImapEmitter[K]>): boolean {
		return super.emit(event, ...args);
	}

	constructor(options = { host: "", port: 143, timeout: 60000, allowStringOutput: false, maxConnections: 100000 }) {
		super();

		const tcpServer = createServer((socket: Socket) => {
			const socketData = { listOfMailBox: null, loginCredentials: null };

			const session = new Session(this, socket, options);
			const capability = new Capability(session);
			const mailbox = new Mailbox(session);
			const message = new Message(session);

			socket.on("data", (stream) => {
				const [tag, command, ...args] = stream.toString().trim().split(" ");
				this.emit("data", socket, options.allowStringOutput ? stream.toString() : stream);

				let permissions: string[] = [];
				const commands = {
					tag,
					command,
					data: args,
				};

				// commands don't have permission
				if (!tag || !command) {
					Errors.invalidSyntax(session, tag);
					return;
				}

				// TODO: fix this for login command
				// if (!capability.isAllowed(command)) {
				// 	Errors.noPermission(session, tag);
				// 	return;
				// }

				switch (command) {
					case "STARTTLS":
						session.startTLS(commands);
						break;
					case "LOGIN":
						session.login(commands);
						break;
					case "LOGOUT":
						session.logout(commands);
						break;

					// caapability
					case "CAPABILITY":
						capability.capability(commands);
						break;
					case "NOOP":
						capability.noop(commands);
						break;

					// mailbox commands
					case "LIST":
						mailbox.list(commands);
						break;
					case "EXAMINE":
						permissions.push("read");
					case "SELECT":
						permissions.push("write");
						mailbox.select(commands, permissions);
						break;
					case "CREATE":
					case "DELETE":
					case "SUBSCRIBE":
					case "UNSUBSCRIBE":
						mailbox.createDeleteSubscribeUnsubscribe(commands);
						break;
					case "RENAME":
						mailbox.rename(commands);
						break;
					case "CLOSE":
						mailbox.close(commands);
						break;

					// message commands
					case "EXPUNGE":
						message.expunge(commands);
						break;
					case "COPY":
						message.copy(commands);
						break;
					case "STORE":
						message.store(commands);
						break;

					// session management
					case "AUTHENTICATE":
					// capability
					case "IDLE":
					// mailbox
					case "LSUB":
					//message handling
					case "FETCH":
					case "SEARCH":
					case "STORE":
					case "COPY":
					case "UID":
					// flags
					case "STATUS":
					case "CHECK":
					// miscellaneous
					case "APPEND":
					case "ENABLE":
					case "ID":
					case "DONE":
						this.emit(
							"unhandledcommands",
							socket,
							({ type, data }: { type: "error" | "success"; data: string | Array<string> }) => {
								if (Array.isArray(data)) {
									data = data.join(" ");
								}

								const responseText = type == "error" ? "NO" : type == "success" ? "OK" : "";

								responseText && session.response(`${tag} ${responseText} ${data}`);
							},
							commands
						);
						break;
					default:
						session.response(`${tag} BAD Command not recognized or unsupported`);
				}
			});

			socket.on("error", (err) => this.emit("error", err, socket));
			socket.on("close", (hadError) => this.emit("close", hadError, socket));
			socket.on("end", () => this.emit("end", socket));
		});

		tcpServer.on("listening", () => this.emit("listen"));
		tcpServer.on("connection", (socket) => this.emit("connect", socket));
		tcpServer.on("drop", (data) => this.emit("drop", data));
		tcpServer.on("error", (err: Error) => this.emit("servererror", err));
		tcpServer.on("close", () => this.emit("serverclose"));

		this.defaultServerConfiguration(tcpServer, options);
		tcpServer.listen(options.port, options.host);

		this.server = tcpServer;
	}

	maxConnections(max: number) {
		this.server.maxConnections = max;
	}

	private defaultServerConfiguration(server: any, options: OptionInterface) {
		server.maxConnections = options.maxConnections;
	}
}

export { IMAP };
