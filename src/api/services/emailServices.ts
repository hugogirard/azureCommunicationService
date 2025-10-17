
import { EmailClient, EmailSendResponse, EmailMessage } from '@azure/communication-email';


class EmailService {

    private _emailClient: EmailClient;

    constructor(connectionString: string) {
        this._emailClient = new EmailClient(connectionString);
    }

    async sendEmailMessage(message: EmailMessage): Promise<string> {
        const originalPoller = await this._emailClient.beginSend(message);
        return originalPoller.toString();
    }

    async getStatusEmail(serializedPoller: string): Promise<EmailSendResponse | undefined> {
        const resumePoller = await this._emailClient.beginSend(<any>undefined, { resumeFrom: serializedPoller });
        return resumePoller.getResult();
    }
}

export default EmailService;

