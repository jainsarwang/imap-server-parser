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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const tls_1 = __importDefault(require("tls"));
const Utils = __importStar(require("../utils/Utils"));
const constants_1 = require("../utils/constants");
const Error_1 = require("../utils/Error");
class Session {
    socket;
    options;
    interconnection;
    parent;
    socketData;
    constructor(parent, socket, options) {
        this.interconnection = {};
        this.parent = parent;
        this.socket = socket;
        this.options = options;
        this.socketData = {};
        this.defaultSocketConfiguration();
        this.response(`* OK IMAP4rev1 server ready`);
    }
    get getSocket() {
        return this.socket;
    }
    get getOptions() {
        return this.options;
    }
    updateSocket(newSocket) {
        this.socket = newSocket;
    }
    startTLS(commands) {
        if (this.options.ssl) {
            // socket.response("* OK Begin TLS negotiation now");
            this.response(`${commands.tag} OK STARTTLS completed`, () => {
                this.upgradeToTLS();
                // this.socket = this.upgradeToTLS();
            });
        }
        else {
            this.response(`${commands.tag} NO STARTTLS not supported`);
        }
    }
    upgradeToTLS() {
        if (this.options.ssl) {
            const { cert, key } = this.options.ssl;
            if (!cert || !key) {
                this.parent.emit("error", new Error("Cert and key is required"), this.socket);
            }
            // creating secure socket
            const secureSocket = new tls_1.default.TLSSocket(this.socket, {
                cert,
                key,
                isServer: true,
            });
            // transferring listeners
            const eventNames = this.socket.eventNames();
            for (const event of eventNames) {
                if (event === "secureConnect")
                    continue;
                const listeners = this.socket.listeners(event);
                for (const listener of listeners) {
                    secureSocket.on(event, listener.bind(this.socket));
                }
            }
            secureSocket.on("secureConnect", () => {
                secureSocket.write(`* OK IMAP4rev1 TLS ready\r\n`);
            });
            this.defaultSocketConfiguration(secureSocket);
            this.socket = secureSocket;
        }
    }
    login(commands) {
        if (commands.data.length != 2) {
            // invalid no of arguments
            Error_1.Errors.invalidSyntax(this, commands.tag);
            return;
        }
        const authData = { username: commands.data[0], password: commands.data[1] };
        this.parent.emit("auth", this.socket, authData, Utils.errorEventCallback(this, {
            tag: commands.tag,
            successResponse: `LOGIN completed.`,
            onSuccess: () => {
                // storing auth for future use
                this.socketData.loginCredentials = authData;
                // adding supported commands
                this.interconnection.Capability?.addCommands(...Object.values(constants_1.Commands.postAuthentication));
            },
        }));
    }
    logout(commands) {
        this.parent.emit("logout", this.socket, Utils.errorEventCallback(this, {
            tag: commands.tag,
            successResponse: ``,
            onSuccess: () => {
                this.response("* BYE IMAP4rev1 server logging out.");
                this.response(`${commands.tag} OK LOGOUT Completed`);
                this.socket.end();
            },
        }));
    }
    response(string, cb) {
        this.socket.write(`${string}\r\n`, cb);
        return this;
    }
    defaultSocketConfiguration(socket) {
        let soc = this.socket;
        if (socket) {
            soc = socket;
        }
        this.options.allowStringOutput && soc.setEncoding("utf8");
        // socket.setNoDelay(true);
        // socket.setKeepAlive(true, 60000);
        // soc.timeout = this.options.timeout;
    }
}
exports.Session = Session;
