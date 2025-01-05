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
exports.Message = void 0;
const Error_1 = require("../utils/Error");
const Utils = __importStar(require("../utils/Utils"));
class Message {
    session;
    parent;
    constructor(session) {
        session.interconnection.Message = this;
        // initialization
        this.session = session;
        this.parent = session.parent;
    }
    isAccessible(tag) {
        if (this.session.socketData.selectedMailboxInfo)
            return true;
        Error_1.Errors.noMailboxSelected(this.session, tag);
        return false;
    }
    expunge(commands) {
        if (!this.isAccessible(commands.tag))
            return;
        this.parent.emit("expunge", this.session.getSocket, Utils.errorEventCallback(this.session, {
            tag: commands.tag,
            successResponse: "EXPUNGE completed.",
        }));
    }
    copy(commands) {
        if (commands.data.length != 2) {
            Error_1.Errors.invalidSyntax(this.session, commands.tag);
            return;
        }
        const parsedMessageSet = this.parseMessageSet(commands.data[0], commands.tag);
        if (parsedMessageSet) {
            this.parent.emit("copy", this.session.getSocket, parsedMessageSet, commands.data[1], Utils.errorEventCallback(this.session, {
                tag: commands.tag,
                successResponse: `[COPYUID] COPY completed`,
            }));
        }
    }
    store(commands) {
        if (commands.data.length < 3) {
            Error_1.Errors.invalidSyntax(this.session, commands.tag);
            return;
        }
        const [messageSet, flagType, ...flagsArr] = commands.data;
        const flagsStr = flagsArr.join(" "), parsedMessageSet = this.parseMessageSet(messageSet, commands.tag), type = flagType.match(/^((?<add>\+)|(?<remove>-))?FLAGS$/), flags = flagsStr.match(/^\((.+)\)$/);
        if (parsedMessageSet == null || flags == null || type == null || type.groups == undefined) {
            Error_1.Errors.invalidSyntax(this.session, commands.tag);
            return;
        }
        const data = {
            type: type.groups.add ? "add" : type.groups.remove ? "remove" : "replace",
            messageSet: parsedMessageSet,
            flags: flags[1].split(" "),
        };
        this.parent.emit("store", this.session.getSocket, data, Utils.successEventCallback(this.session, {
            tag: commands.tag,
            defaultError: Error_1.Errors.serverError,
            successResponse: "STORE completed",
            processSuccessResponseData: (data) => {
                if (!Array.isArray(data)) {
                    return;
                }
                return data.map((item) => `* ${item.message} FETCH (FLAGS (${item.flags.join(" ")}))`);
            },
        }));
    }
    /**
     *
    */
    parseMessageSet(messageSet, tag) {
        const result = [];
        let isError = false;
        messageSet.split(",").forEach((seq) => {
            const rangeMatch = seq.match(/^(?<from>\d+|\*):(?<to>\d+|\*)$/);
            var from = 0, to = 0;
            if (rangeMatch && rangeMatch.groups) {
                from = rangeMatch.groups.from;
                to = rangeMatch.groups.to;
            }
            if (seq.includes(":") &&
                rangeMatch &&
                rangeMatch.groups &&
                (from == "*" || to == "*" || Number(from) <= Number(to))) {
                result.push({
                    from: from == "*" ? "*" : Number(from),
                    to: to == "*" ? "*" : Number(to),
                });
            }
            else if (seq.match(/^\d+|\*$/)) {
                result.push(seq == "*" ? seq : Number(seq));
            }
            else {
                Error_1.Errors.invalidMessageSet(this.session, tag);
                isError = true;
                return;
            }
        });
        return isError ? null : result;
    }
}
exports.Message = Message;
