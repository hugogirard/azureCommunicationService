import { Router, Request, Response } from 'express';
import EmailService, { } from '../services/emailServices.js'
import BaseController from './baseController.js';

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
         * /api/email/send:
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
         *             senderAddress: "DoNotReply@email.hugogirard.net"
         *             recipients:
         *               to:
         *                 - address: "recipient@example.com"
         *                   displayName: "Recipient Name"
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

    async sendEmail(req: Request, res: Response) {
        try {
            res.json('hello world');
        } catch (error: any) {
            console.log(`Error in sending email: ${error.message}`)
            res.status(500).json({ error: 'Internal Server error' });
        }
    }
}