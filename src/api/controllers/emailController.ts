import { Router, Request, Response } from 'express';
import EmailService, { } from '../services/emailServices.js'
import BaseController from './baseController.js';
import { EmailMessage } from '@azure/communication-email';
import config from '../config.js';

/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Email sending operations
 */
export default class EmailController extends BaseController {

    private _emailService: EmailService;

    constructor(emailService: EmailService) {
        super();
        this._emailService = emailService;
    }

    initialize(): Router {
        /**
         * @swagger
         * /api/email:
         *   post:
         *     summary: Send an email
         *     tags: [Email]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/EmailMessage'
         *           example:
         *             recipients:
         *               to:
         *                 - address: "recipient@example.com"
         *             subject: "Test Email from Azure Communication Services"
         *             content:
         *               plainText: "This is a test email"
         *               html: "<html><body><h1>This is a test email</h1></body></html>"
         *     responses:
         *       200:
         *         description: Email sent successfully
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/EmailResponse'
         *       400:
         *         description: Bad request
         *       500:
         *         description: Server error
         */
        this._router.post('/', this.sendEmail.bind(this));

        return this._router;
    }

    async sendEmail(req: Request, res: Response): Promise<void> {
        try {
            const body = req.body;
            // Transform the request to match Azure Communication Services format
            const message: EmailMessage = {
                senderAddress: config.sender,
                content: {
                    subject: body.subject,
                    plainText: body.content?.plainText,
                    html: body.content?.html
                },
                recipients: body.recipients
            };
            const messageId = await this._emailService.sendEmailMessage(message);
            res.json({ messageId });
        } catch (error: any) {
            console.log(`Error in sending email: ${error.message}`)
            res.status(500).json({ error: 'Internal Server error' });
        }
    }
}