import BaseController from "../controllers/baseController.js";

export default interface ControllerConfig {
    path: string;
    instance: BaseController;
}