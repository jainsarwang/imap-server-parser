import { ImapEmitter } from "./utils/types";
import EventEmitter from "events";
declare class IMAP extends EventEmitter {
    private server;
    on<K extends keyof ImapEmitter>(event: K, listener: ImapEmitter[K]): this;
    emit<K extends keyof ImapEmitter>(event: K, ...args: Parameters<ImapEmitter[K]>): boolean;
    constructor(options?: {
        host: string;
        port: number;
        timeout: number;
        allowStringOutput: boolean;
        maxConnections: number;
    });
    maxConnections(max: number): void;
    private defaultServerConfiguration;
}
export { IMAP };
