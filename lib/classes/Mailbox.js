"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mailbox = void 0;
const constants_1 = require("../utils/constants");
const Utils = __importStar(require("../utils/Utils"));
const Error_1 = require("../utils/Error");
class Mailbox {
    session;
    parent;
    constructor(session) {
        session.interconnection.Mailbox = this;
        // initialization
        this.session = session;
        this.parent = session.parent;
    }
    list(commands) {
        if (commands.data.length != 2) {
            Error_1.Errors.invalidSyntax(this.session, commands.tag);
            return;
        }
        this.parent.emit("list", this.session.getSocket, {
            reference_name: commands.data[0],
            mailbox_name: commands.data[1],
        }, Utils.successEventCallback(this.session, {
            tag: commands.tag,
            defaultError: Error_1.Errors.serverError,
            successResponse: "LIST completed",
            processSuccessResponseData: (data) => {
                if (!Array.isArray(data)) {
                    Utils.throwError(this.parent, "servererror", "Respose data must be of type Array");
                    return;
                }
                // TODO: Add add mailbox available to listOfMailBox
                // this.session.socketData.listOfMailBox = data;
                return data.map((d) => `* LIST (${d.flag ?? constants_1.ListFlags.HasNoChildren}) "${d.delimeter ?? "/"}" "${d.mailbox ?? ""}"`);
            },
        }));
    }
    select(commands, permission) {
        if (commands.data.length != 1) {
            Error_1.Errors.invalidSyntax(this.session, commands.tag);
            return;
        }
        const command = commands.command.toLowerCase();
        this.parent.emit(command, this.session.getSocket, permission, Utils.successEventCallback(this.session, {
            tag: commands.tag,
            defaultError: Error_1.Errors.serverError,
            successResponse: `[${command == "select" ? "READ-WRITE" : "READ-ONLY"}] ${command.toUpperCase()} completed.`,
            processSuccessResponseData: (data) => {
                if (typeof data != "object" || !("exists" in data)) {
                    Utils.throwError(this.parent, "error", "Exists is mandatory.");
                    return;
                }
                const response = [];
                data.flags && data.flags.length > 0 && response.push(`* FLAGS (${data.flags.join(" ")})`);
                response.push(`* ${data.exists ?? 0} EXISTS`);
                data.recent && response.push(`* ${data.recent} RECENT`);
                data.uidValidity && response.push(`* OK [UIDVALIDITY ${data.uidValidity}] UIDs valid`);
                data.permanentFlags &&
                    data.permanentFlags.length > 0 &&
                    response.push(`* OK [PERMANENTFLAGS (${command == "examine" ? "" : data.permanentFlags.join(" ")})] Flags allowed`);
                data.uidNext && response.push(`* OK [UIDNEXT ${data.uidNext}] Predicted next UID`);
                // storing select mailbox
                this.session.socketData.selectedMailboxInfo = {
                    flag: data.flags,
                    mailbox: commands.data.join(" "),
                };
                // add
                return response;
            },
        }));
    }
    createDeleteSubscribeUnsubscribe(commands) {
        if (commands.data.length != 1) {
            Error_1.Errors.invalidSyntax(this.session, commands.tag);
            return;
        }
        const command = commands.command.toLowerCase();
        this.parent.emit(command, this.session.getSocket, commands.data, Utils.errorEventCallback(this.session, {
            tag: commands.tag,
            successResponse: `${command.toUpperCase()} completed.`,
            onSuccess: () => {
                // TODO: Add or remove mailbox from listOfMailBox
            },
        }));
    }
    rename(commands) {
        if (commands.data.length != 2) {
            Error_1.Errors.invalidSyntax(this.session, commands.tag);
            return;
        }
        this.parent.emit("rename", this.session.getSocket, commands.data[0], commands.data[1], Utils.errorEventCallback(this.session, {
            tag: commands.tag,
            successResponse: "RENAME completed.",
        }));
    }
    close(commands) {
        if (!this.session.socketData.selectedMailboxInfo) {
            Error_1.Errors.noMailboxSelected(this.session, commands.tag);
            return;
        }
        this.parent.emit("closemailbox", this.session.getSocket, Utils.errorEventCallback(this.session, {
            tag: commands.tag,
            successResponse: "CLOSE Completed.",
            onSuccess: () => {
                this.session.socketData.selectedMailboxInfo = undefined;
            },
        }));
    }
}
exports.Mailbox = Mailbox;
