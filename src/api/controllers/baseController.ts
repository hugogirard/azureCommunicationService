import { Router } from "express";

export default abstract class BaseController {
    abstract initialize(): Router;
    public _router: Router;

    constructor() {
        this._router = Router();
    }
}