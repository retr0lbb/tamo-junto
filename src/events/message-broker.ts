import { EventEmitter } from "node:events";

class MessageBroker extends EventEmitter {}

export const messageBroker = new MessageBroker();
