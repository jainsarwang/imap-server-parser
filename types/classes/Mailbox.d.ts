import { Session } from "./Session";
import { CommandType } from "../utils/types";
declare class Mailbox {
    private session;
    private parent;
    constructor(session: Session);
    list(commands: CommandType): void;
    select(commands: CommandType, permission: string[]): void;
    createDeleteSubscribeUnsubscribe(commands: CommandType): void;
    rename(commands: CommandType): void;
    close(commands: CommandType): void;
}
export { Mailbox };
