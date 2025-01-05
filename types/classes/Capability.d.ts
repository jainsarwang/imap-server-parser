import { CommandType } from "../utils/types";
import { Session } from "./Session";
declare class Capability {
    private session;
    private parent;
    private supportedCommands;
    private socket;
    constructor(session: Session);
    capability(commands: CommandType): void;
    noop(commands: CommandType): void;
    addCommands(...commands: string[]): void;
    isAllowed(command: string): boolean;
    get getCommands(): string[];
    removeCommands(command: string): void;
    get getCommandsAsString(): string;
}
export { Capability };
