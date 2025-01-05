import type { Session } from "../classes/Session";
import { responseDataErrorType } from "./types";
import { EventEmitter } from "stream";
interface errorInterface {
    successResponse: string;
    tag: string;
    onSuccess?: Function;
}
interface successInterface {
    defaultError: (session: Session, tag: string) => void;
    tag: string;
    successResponse: string;
    processSuccessResponseData: Function;
    [key: string]: any;
}
export declare const errorEventCallback: (session: Session, { successResponse, tag, onSuccess }: errorInterface) => ((data?: responseDataErrorType | string) => void);
export declare const successEventCallback: (session: Session, { defaultError, tag, successResponse, processSuccessResponseData }: successInterface) => ((data?: responseDataErrorType | string | any) => void);
export declare const throwError: (emitter: EventEmitter, event: string, error: any, ...args: any[]) => void;
export {};
