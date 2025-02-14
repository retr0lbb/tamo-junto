import { ServerError } from "../_errors/serverError";
import type { EventNames } from "./events";
import { messageBroker } from "./message-broker";

export abstract class EventHandler {
	protected brokerInstance = messageBroker;

	constructor() {
		this.setUpListeners();
	}

	protected abstract setUpListeners(): void;

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	protected emitEvent(eventName: EventNames, message: any) {
		this.brokerInstance.emit(eventName, message);
	}

	protected handleError(error: any, customMessage?: string) {
		console.error(error);

		throw new ServerError(
			customMessage || "An error occured processing this event",
		);
	}
}
