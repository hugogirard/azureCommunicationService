import EmailService from "../services/emailServices.js";
import EmailController from "./emailController.js";
import ControllerConfig from "../types/controllerConfig.js";
import config from '../config.js';

const controllers: ControllerConfig[] = [
    {
        path: '/api/email',
        instance: new EmailController(new EmailService(config.communicationConnectionString)),
    }

]

export default controllers;