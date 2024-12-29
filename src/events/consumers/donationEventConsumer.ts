import { ClientError } from "../../_errors/clientError";
import { type mailOptions, sendAnEmail } from "../../lib/mailtransport";
import { prisma } from "../../lib/prisma";
import { messageBroker } from "../message-broker";

class donationConsumer {}

new donationConsumer();
