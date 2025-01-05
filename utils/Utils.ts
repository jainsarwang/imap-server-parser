import type { Session } from "../classes/Session";
import { CommandType, responseDataErrorType } from "./types";
import { Errors } from "./Error";
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

// if no data passed it is consider as success
export const errorEventCallback = (
	session: Session,
	{ successResponse, tag, onSuccess }: errorInterface
): ((data?: responseDataErrorType | string) => void) => {
	return (data) => {
		if (!data) {
			successResponse.length > 0 && session.response(`${tag} OK ${successResponse}`);
			if (onSuccess) onSuccess();

			return;
		}

		if (typeof data == "string") {
			session.response(`${tag} NO ${data}`);
			return;
		}

		if ("isError" in data && data.isError) {
			if (!data.type) {
				throwError(session.parent, "servererror", "Type property is mandatory in Error Callback function.");
				return;
			}

			Errors[data.type]
				? Errors[data.type].apply(this, [session, tag])
				: throwError(session.parent, "error", "Invalid type provided to response.", session.getSocket);

			return;
		}
	};
};

// if no data or string is passes it is error
export const successEventCallback = (
	session: Session,
	{ defaultError, tag, successResponse, processSuccessResponseData }: successInterface
): ((data?: responseDataErrorType | string | any) => void) => {
	return (data) => {
		if (!data) {
			defaultError(session, tag);
			return;
		}
		if (typeof data == "string") {
			session.response(`${tag} NO ${data}`);
			return;
		}

		if (typeof data == "object" && "isError" in data && data.isError) {
			if (!("type" in data)) {
				throwError(session.parent, "servererror", "Type property is mandatory in Error Callback function.");
				return;
			}

			data.type in Errors
				? Errors[data.type as keyof typeof Errors].apply(this, [session, tag])
				: throwError(session.parent, "error", "Invalid type provided to response.", session.getSocket);

			return;
		}

		// success
		const finalArr: string[] = [];
		/* 
		if (Array.isArray(data)) finalArr.push(...processSuccessResponseData(data));
		else finalArr.push(processSuccessResponseData(data)); */

		finalArr.push(...processSuccessResponseData(data));

		for (const i of finalArr) {
			session.response(i);
		}
		session.response(`${tag} OK ${successResponse}`);
	};
};

// throw error if error listener is not describe
export const throwError = (emitter: EventEmitter, event: string, error: any, ...args: any[]) => {
	const err = new Error(error);

	if (!emitter.emit(event, err, ...args)) throw err;
};
