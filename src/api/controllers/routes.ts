import EmailService from "../services/emailServices.js";
import EmailController from "./emailController.js";
import ControllerConfig from "../types/controllerConfig.js";

const controllers: ControllerConfig[] = [
    {
        path: '/api/email',
        instance: new EmailController(new EmailService),
    }

]

export default controllers;