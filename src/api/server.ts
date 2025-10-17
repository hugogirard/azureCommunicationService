import express from 'express';
import config from './config.js';
import controllers from './controllers/routes.js';


const app = express();
const port = config.port;

controllers.forEach(controller => {
    app.use(controller.path, controller.instance.initialize())
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});