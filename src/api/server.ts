import express from 'express';
import config from './config.js';
import controllers from './controllers/routes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './openapi.js';

const app = express();
const port = config.port;

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// OpenAPI JSON endpoint
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

controllers.forEach(controller => {
    app.use(controller.path, controller.instance.initialize());
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger UI available at http://localhost:${config.port}/api-docs`);
});