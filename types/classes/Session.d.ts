import { Socket } from "net";
import { IMAP } from "../IMAP";
import type { CommandType, InterconnectionType, OptionInterface, SocketDataType } from "../utils/types";
declare class Session {
    private socket;
    private options;
    interconnection: InterconnectionType;
    parent: IMAP;
    socketData: SocketDataType;
    constructor(parent: IMAP, socket: Socket, options: OptionInterface);
    get getSocket(): Socket;
    get getOptions(): OptionInterface;
    updateSocket(newSocket: Socket): void;
    startTLS(commands: CommandType): void;
    private upgradeToTLS;
    login(commands: CommandType): void;
    logout(commands: CommandType): void;
    response(string: string, cb?: any): this;
    private defaultSocketConfiguration;
}
export { Session };
