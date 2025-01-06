# IMAP Server Parser

A robust and lightweight IMAP server parser written in TypeScript, capable of handling over 25+ IMAP commands (as of now, will cover rest in future release). This package simplifies the parsing of IMAP protocol requests and responses, making it ideal for building IMAP servers or clients that integrate with providers such as `Gmail`, `Outlook` or any other.

## Features

-   **Full IMAP Command Support:** Implements 25+ essential IMAP commands (e.g., LOGIN, SELECT, FETCH, LOGOUT, and more such).
-   **TLS Upgradation:** Automatically upgrade connections to `TLS`.
-   **Events Support**: Emit events for various IMAP actions like `connection`, `authentication`, and `message retrieval`.
-   **Gmail and Outlook Compatible:** Tested to ensure seamless communication with `major email providers`.
-   **Lightweight and Fast:** Designed for performance-critical applications.
-   **Written in TypeScript:** Offers type safety and excellent developer experience.

## Quick Links

-   [Installation](#installation)
-   [Usage](#usage)
-   [Options](#options)
-   [IMAP Commands and their events](#imap-commands-and-their-events)
-   [Supported Object Syntax](#supported-object-syntax)

    -   [Error Object](#error-object)
    -   [Drop Object](#dropobject)
    -   [MailBoxData Object](#mailboxdata)
    -   [Noop Success Response](#noopdataobject)
    -   [Authentication Object](#authenticationobject)
    -   [Mailbox Listing Object](#listofmailbox)
    -   [Requested Mailboxes Path information](#requestedpathinfoobj)
    -   [Select or examine command response](#selectorexaminesuccesstype)

-   [Flags](#flags)
-   [Important Terms](#important-terms)

## Installation

To install the package, run the following command:

```bash
npm install imap-server-parser
```

## Importing in your project

Importing Imap Server Parser to your project.

-   In JavaScript File:

    ```javascript
    const { IMAP } = require("imap-server-parser");
    ```

-   In TypeScript File:
    ```typescript
    const { IMAP } from "imap-server-parser"
    ```

## Usage

Here is the basic syntax for using this package:

```javascript
const { IMAP } = require("imap-server-parser");

const imap = new IMAP(options);

imap.on('<CommandEvent>', (<supported params>) => {
    // task you want to perform
});
```

You can see list of event Listener and there syntax [here](#imap-commands-and-their-events).

## Options

`options` defines the behaviour of the server.

| Property          | Data Type     | Default Value | Description                                                                                 |
| ----------------- | ------------- | ------------- | ------------------------------------------------------------------------------------------- |
| port              | number        | 143           | Port number to which server will bind to.                                                   |
| host              | string        | ""            | Hostname of the server.                                                                     |
| timeout           | number(in ms) | 60000         |                                                                                             |
| allowStringOutput | boolean       | false         | Can only be used with `data` event, provides the commands requested call in form of string. |
| ssl               | object        |               | used to upgrade the connected to TLS when requested by client.                              |
| ssl.cert          | Buffer        |               | File buffer of the SSL Certificate.                                                         |
| ssl.key           | Buffer        |               | File buffer of SSL Private key.                                                             |
| maxConnections    | number        | 100000        | Max number of simultanious connections are allowed.                                         |

`Note: None of the above value are mandatory.`

## IMAP Commands and their events

|    Command     |        Event        |                                            Arguments                                            |                        Callback Parameters                        | Description                                                                   |
| :------------: | :-----------------: | :---------------------------------------------------------------------------------------------: | :---------------------------------------------------------------: | ----------------------------------------------------------------------------- |
|       -        |      `listen`       |                                                -                                                |                                 -                                 | Server starts listening on the specified port. [SERVER]                       |
|       -        |       `drop`        |                                object: [DropObject](#dropobject)                                |                                 -                                 | When maxConnection exceeds, new connections get dropped/disconnected.[SERVER] |
|       -        |    `servererror`    |                                         (error: Error)                                          |                                 -                                 | When there any error occurs on server. [SERVER]                               |
|       -        |    `serverclose`    |                                                -                                                |                                 -                                 | When server get closed. [SERVER]                                              |
|       -        |      `connect`      |                                        (socket: Socket)                                         |                                 -                                 | When a new client is connected to server.                                     |
|       -        |       `error`       |                                 (error: Error, socket: Socket)                                  |                                 -                                 | When error occurs with the connection with clients.                           |
|       -        |       `close`       |                               (hadError: boolean, socket: Socket)                               |                                 -                                 | The connection with the client is Closed.                                     |
|       -        |        `end`        |                                                -                                                |                                 -                                 | Writing side of socket is closed.                                             |
| [All Commands] |       `data`        |                           (socket: Socket, stream: Buffer \| string)                            |       <!-- TODO needs to add all command functionality -->        | When any data is provided to the socket.                                      |
|      NOOP      |       `noop`        |              (socket: Socket, mailboxInfo?: [MailBoxData](#mailboxdata), callback)              |             (data: [NoopDataObject](#noopdataobject))             | Keeps the connection alive without performing any action.                     |
|     LOGIN      |       `auth`        |       (socket: Socket, authData: [AuthenticationObject](#authenticationobject), callback)       |                                ()                                 | Authenticates the user with a username and password.                          |
|     LOGOUT     |      `logout`       |                                   (socket: Socket, callback)                                    |                                ()                                 | Terminates the session and logs the user out.                                 |
|      LIST      |       `list`        |   (socket:Socket,requestedPathInfo: [RequestedPathInfoObj](#requestedpathinfoobj), callback)    |            (data?: [ListOfMailBox](#listofmailbox)[])             | Lists all mailboxes or specific ones based on a pattern.                      |
|     SELECT     |      `select`       |                        (socket: Socket, permission: string[], callback)                         | (data: [SelectOrExamineSuccessType](#selectorexaminesuccesstype)) | Selects a mailbox for accessing messages.                                     |
|    EXAMINE     |      `examine`      |                        (socket: Socket, permission: string[], callback)                         | (data: [SelectOrExamineSuccessType](#selectorexaminesuccesstype)) | Opens a mailbox in read-only mode.                                            |
|     CREATE     |      `create`       |                        (socket: Socket, mailboxName: string[], callback)                        |                                ()                                 | Creates a new mailbox.                                                        |
|     DELETE     |      `delete`       |                        (socket: Socket, mailboxName: string[], callback)                        |                                ()                                 | Delete a mailbox.                                                             |
|   SUBSCRIBE    |     `subscribe`     |                        (socket: Socket, mailboxName: string[], callback)                        |                                ()                                 | Subscribes to a mailbox.                                                      |
|  UNSUBSCRIBE   |    `unsubscribe`    |                        (socket: Socket, mailboxName: string[], callback)                        |                                ()                                 | Unsubscribes from a mailbox.                                                  |
|     RENAME     |      `rename`       |                  (socket: Socket, oldName: string, newName: string, callback)                   |                                ()                                 | Renames an existing mailbox.                                                  |
|     CLOSE      |   `closemailbox`    |                                   (socket: Socket, callback)                                    |                                ()                                 | Closes the selected mailbox and removes any deleted messages.                 |
|    EXPUNGE     |      `expunge`      |                                   (socket: Socket, callback)                                    |                                ()                                 | Removes messages marked as deleted from the mailbox.                          |
|      COPY      |       `copy`        | (socket: Socket, messages: [ParsedMessageSet](#parsedmessageset), destiation: string, callback) |                                ()                                 | Allows a client to copy messages from one mailbox to another.                 |
|       -        | `unhandledcommands` |                             (socket: Socket, callback, ...commands)                             |              ({type: error \| success, data: Array})              | The commands which are not implemented, till this version.                    |

**Note:**

-   All the callback functions supports error object in case if user wants to return some error, [see here](#error-object).
-   If any `string` value is provide in the callback it is treated as the error.
-   If callback requires a response and no response is provide by the user, it will result in the `Server Error`.

## Supported Object Syntax

### Error Object

Use where there is need of returning error through callback function.

```javascript
{
    isError: <boolean>, // Indicates if an error occurred, must be true always
    type: <string>       // Type of error
}
```

**Type can be one of the following:**
| Type| Description (Returns Value) |
|:---:|---|
| `invalidSyntax`| Invalid syntax. |
| `noPermission`| You do not have permission to access. |
| `inUse`| Mailbox is currently in use. |
| `unknownCommand`| Unknown command. |
| `unknownError`| Unknown error. |
| `notExists`| [NONEXISTENT] Mailbox does not exists. |
| `alreadyExists`| [ALREADYEXISTS] Mailbox already exists. |
| `serverError`| [SERVERERROR] Something went wrong. |
| `quotaExceeds`| [QUOTA] Mailbox quota exceeded. |
| `notFound`| [CANNOT] Invalid Mailbox Name. |
| `noMailboxSelected`| No mailbox selected. |
| `alreadySubscribed`| Mailbox already subscribed. |
|`invalidMessageSet` | Invalid message set syntax. |
|`tryCreate` | [TRYCREATE] Mailbox doesn't exist. |
|`noMessage` | No Such message exists. |

### DropObject

The `DropObject` is provided by the **`drop`** event, containing details about the connection that was terminated.

```javascript
{
    localAddress: <string>,  // Server's local address
    localPort: <number>,     // Server's local port
    localFamily: <string>,   // Address family (e.g., 'IPv4', 'IPv6')
    remoteAddress: <string>, // Client's remote address
    remotePort: <number>,    // Client's remote port
    remoteFamily: <string>   // Client's address family (e.g., 'IPv4', 'IPv6')
}
```

### MailBoxData

Provide the data about the previously **selected mailbox**.

```javascript
{
    flag: MailBoxFlags[], // Array of mailbox flags
    mailbox: string,       // Name of the selected mailbox
    delimeter?: string     // Optional delimiter for mailbox hierarchy
}
```

-   You can find list of Available mail box flags [here](#mail-box-flags).
-   The flag field supports \* as a value, representing **All Flags**.
-   If **no mailbox** is selected, the mailbox commands will return `null`.

### NoopDataObject

This object is used in the success response of the `NOOP` command, providing status updates on the **selected mailbox**.

```javascript
{
    exists?: number,  // Number of existing messages in the mailbox
    recent?: number,  // Number of recent (new) messages since the last session
    expunge?: number  // Number of messages marked for deletion
}
```

-   `exists`: Represents the total number of messages currently in the mailbox.
-   `recent`: Indicates how many new messages have arrived since the last check.
-   `expunge`: Shows how many messages were marked for deletion during the `NOOP` execution.

This object helps monitor mailbox status without altering its state, making it useful for maintaining idle connections and periodic status checks.

### AuthenticationObject

Used with the `auth` event listener, this object provides information about the client’s credentials for authentication.

```javascript
{
    username: string,  // The username provided by the client
    password: string   // The password provided by the client
}
```

-   `username`: Represents the client’s username or email used for authentication.
-   `password`: Contains the password associated with the username.

This object allows the server to validate the client’s credentials during the authentication process.

### ListOfMailBox

This object is similar to the [MailBoxData](#mailboxdata) object, but it supports different mailbox listing flags. The `flags` key contains values that represent the properties of the mailbox in the context of listing.

```javascript
{
    flags: ListOfMailBox[],   // List of flags associated with the mailbox
    mailbox: string,         // Name of the mailbox
    delimiter?: string       // Optional delimiter for hierarchy
}
```

-   `flags`: Contains listing flags that provide information about the mailbox's structure and capabilities, which differ from those in the `MailBoxData` object.
-   `mailbox`: The name of the listed mailbox.
-   `delimiter`: Optional, used for nesting or structuring mailboxes (e.g., / or .).

This object extends MailBoxData to support listing multiple mailboxes with different flags for better mailbox organization. You can find more about available flags here.

### RequestedPathInfoObj

This object is sent by the client to provide information on how to list the mailboxes.

```javascript
{
    reference_name: string,  // The name of the parent or root mailbox
    mailbox_name: string      // The mailbox pattern (e.g., '*' for all mailboxes or '%' for top-level mailboxes)
}
```

-   `reference_name`: Denotes the name of the parent or root mailbox, giving context for the mailbox hierarchy from which to list.
-   `mailbox_name`: Represents the mailbox pattern, where `*` retrieves all available mailboxes, and `%` refers to top-level mailboxes only.

This object helps the client specify its desired criteria for mailbox listing, enabling more efficient management and retrieval of mailboxes on the server.

### SelectOrExamineSuccessType

Used to return the response for `SELECT` or `EXAMINE` commands.

```javascript
{
   flags: MailBoxData[],       // Flags associated with the mailbox
   exists: number,             // Number of messages in the mailbox
   recent: number,             // Number of recent (new) messages
   uidValidity: number,        // Unique identifier validity
   uidNext?: number,           // Next unique identifier to be assigned
   permanentFlags?: string[]    // Array of permanent flags for the mailbox
}
```

-   `flags`: An array of [flags](#mail-box-flags) associated with the mailbox, indicating its properties.
-   `exists`: The total number of messages currently in the mailbox.
-   `recent`: The number of new messages that have arrived since the last session.
-   `uidValidity`: A number that indicates the validity of unique identifiers for messages in the mailbox.
-   `uidNext`: (Optional) The next unique identifier to be assigned to a new message.
-   `permanentFlags`: (Optional) An array of flags that are permanently set for the mailbox (e.g., \Deleted, \Seen).

This object provides essential information about the selected mailbox, helping clients understand its state and manage their interactions effectively.

### ParsedMessageSet

Provides an array containing a set of message IDs or UIDs using a range object, a single number, or a wildcard (`'*'`) sent by the client for actions like `COPY`, `FETCH`, or others.

```javascript
[
    {
        from: <number>,  // Starting message ID or UID in the range
        to: <number>     // Ending message ID or UID in the range
    },
    <number>,            // A specific message ID or UID
    '*'                  // Wildcard to denote all messages
]
```

-   **Range Object:** Specifies a range of messages between from and to.
-   **Single Number:** Targets a specific message ID or UID.
-   **`'*'` Wildcard:** Refers to all available messages in the selected mailbox.

This flexible structure allows clients to mix ranges, individual IDs, and wildcards within the same request for efficient message operations.

## Flags

### Mail Box Flags

Flags that is used to Reference mailboxes.
| Flag | Description |
| :---------: | ----------- |
| `\All` | Contains all emails, including sent, drafts, and received. |
| `\Inbox` | Default inbox where new incoming emails are received. |
| `\Drafts` | Stores unsent or saved email drafts. |
| `\Sent` | Contains emails that have been successfully sent. |
| `\Trash` | Holds deleted emails, often emptied periodically. |
| `\Junk` | Stores emails marked as spam or junk mail. |
| `\Flagged` | Contains emails marked for follow-up or importance. |

### List Mailbox flags

These flags are used when providing a list of mailboxes on the server.
| Flag | Description |
| :---: | --- |
| Noselect| Mailbox exists but cannot be selected (e.g., a parent folder). |
| HasChildren|Mailbox contains one or more child mailboxes. |
| HasNoChildren| Mailbox has no child mailboxes.|
| Noinferiors|No child mailboxes can be created under this mailbox. |

These flags help describe the structure and properties of each mailbox when listing them from the server.

<!-- TODO PERMANENT FLAGS -->

## Important terms

**Delimeter**

A delimiter is used to separate a mailbox folder from its subfolder in the mailbox name. For example, if the mailbox name is Inbox.test, Inbox is the parent or root folder, and test is the subfolder within Inbox.

This helps organize mailboxes hierarchically, allowing clients to manage nested folders effectively.

**UID (Unique Identifier)**

A persistent, unique number assigned to each message in a mailbox. This ID remains the same even if the message’s position changes.

**UIDValidity**

A number assigned to a mailbox to ensure the validity of UIDs. If the UIDValidity value changes, all previous UIDs become invalid.
