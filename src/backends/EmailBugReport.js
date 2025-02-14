import _ from "lodash";

import { BugReportService, ServiceError } from "../Backend";

import { DateTime } from "jsl/utils/DateTime";

/**
 * A bug report service based on EMail using nodemailer.
 *
 * Ensure to call connectIPCMain and connectIPCPreload and npm install nodemailer
 */
export class EmailBugReportService extends BugReportService {
    /**
     * Default configuration
     */
    static defaultConfig() {
        return {
            ...{
                // The receiver
                to: null, // "bug-manager@abcd.com",
                // The sender of the mail. Most SMTP servers reject mails not coming from their own supported domains.
                // So, define a sender in the domain of the server.
                from: null, // "bug-reporter@abcd.com",
                source: null, // which program send this?
                server: {
                    // The SMTP server user name
                    user: null, // "system@abcd.com",
                    // SMTP server password
                    password: null,
                    // The SMTP server URL
                    host: null, // like "smtp.strato.de",
                    // SMTP server port
                    port: 465,
                },
            },
            ...BugReportService.defaultConfig(),
        };
    }

    /**
     * Create the backend service.
     *
     * @param {Object} config - The config as in @see Service.defaultConfig.
     *     Merged with the default.
     */
    constructor(config = {}) {
        super(_.merge(EmailBugReportService.defaultConfig(), config || {}));
    }

    /**
     * Initialize the service. Managed by the Backend instance.
     *
     * @return {Promise} Async promise
     */
    async _init() {
        super._init();

        // this.m_transport = // backend.context.addFeature(rest({ credentials: "include" }));
    }

    /**
     * Send a bug report.
     *
     * @async
     * @param {String} sender - The sender info. Must not be empty/nullish.
     * @param {String} description - A description
     * @param {Array<Object>} attachments - A list of {name, data}
     * @throws {ServiceError} - If the config is invalid
     * @returns {Promise} Resolves on success or rejects on error
     */
    async _send(sender, description, attachments) {
        return window.jslEmailBugReport.send(
            // The full config contains some non-copyable things like errorMap. So copy the relevant data
            {
                to: this.config.to,
                from: this.config.from,
                source: this.config.source,
                server: this.config.server,
            },
            sender,
            description,
            Array.from(attachments, (x) => {
                return { name: x.name || "<unnamed>", data: x.data };
            }).filter((x) => {
                return x.data != null;
            }),
        );
    }
}

/**
 * Construct the electron context bridge and ipc between main and renderer.
 *
 * Call this from prealod!
 */
export function connectIPCPreload() {
    const { contextBridge, ipcRenderer } = require("electron/renderer");

    contextBridge.exposeInMainWorld("jslEmailBugReport", {
        send: (...args) => ipcRenderer.invoke("jslEmailBugReport:send", ...args),
    });
}

/**
 * Function to provide all the IPC functions in the main process.
 *
 * @param {ElectronApp} app - The JSL ElectronApp instance that called this in MAIN
 */
export function connectIPCMain(_app) {
    const { ipcMain } = require("electron/renderer");

    ipcMain.handle("jslEmailBugReport:send", async (_ev, config, sender, description, attachments) => {
        const nodemailer = require("nodemailer");

        const transporter = nodemailer.createTransport({
            host: config.server.host,
            port: config.server.port,
            secure: config.server.port == 465, // true for port 465, false for other ports
            auth: {
                user: config.server.user,
                pass: config.server.password,
            },
        });

        let attachmentsStr = "";
        attachments.forEach((x) => {
            attachmentsStr += " * " + x.name + ": \n" + x.data + "\n\n";
        });

        const info = await transporter.sendMail({
            from: config.from,
            replyTo: sender,
            to: config.to,
            subject: "Bug Report - " + config.source + ": " + DateTime.ddmmyyhhmmss(),
            text: "Description:\n\n" + description + "\n\nAttachments:\n\n" + attachmentsStr,
        });

        console.log("Message sent: %s", info.messageId);
    });
}
