import { Router, Request, Response } from 'express';
import EmailService, { } from '../services/emailServices.js'
import BaseController from './baseController.js';


export default class EmailController extends BaseController {

    private _emailService: EmailService;

    constructor(emailService: EmailService) {
        super();
        this._emailService = emailService;
    }

    initialize(): Router {

        this._router.post('/send', this.sendEmail.bind(this));

        return this._router;
    }

    async sendEmail(req: Request, res: Response) {
        try {

        } catch (error: any) {
            console.log(`Error in sending email: ${error.message}`)
            res.status(500).json({ error: 'Internal Server error' });
        }
    }
}