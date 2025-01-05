import { CommandType } from "../utils/types";
import { Session } from "./Session";
declare class Message {
    private session;
    private parent;
    constructor(session: Session);
    isAccessible(tag: string): boolean;
    expunge(commands: CommandType): void;
    copy(commands: CommandType): void;
    store(commands: CommandType): void;
    /**
     *
    */
    private parseMessageSet;
}
export { Message };
