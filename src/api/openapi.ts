import swaggerJsdoc from 'swagger-jsdoc';
import config from './config.js';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Azure Communication Services Email API',
            version: '1.0.0',
            description: 'API for sending emails using Azure Communication Services',
        },
        servers: [
            {
                url: `http://localhost:${config.port}`,
                description: 'Development server',
            },
        ],
        components: {
            schemas: {
                EmailMessage: {
                    type: 'object',
                    required: ['recipients', 'subject', 'content'],
                    properties: {
                        recipients: {
                            type: 'object',
                            properties: {
                                to: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            address: { type: 'string', format: 'email' },
                                            displayName: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        subject: {
                            type: 'string',
                            example: 'Test Email'
                        },
                        content: {
                            type: 'object',
                            properties: {
                                plainText: { type: 'string' },
                                html: { type: 'string' }
                            }
                        }
                    }
                },
                EmailResponse: {
                    type: 'object',
                    properties: {
                        messageId: {
                            type: 'string',
                            description: 'Serialized poller for tracking email status'
                        }
                    }
                },
                EmailStatus: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['Queued', 'Sent', 'Failed', 'Canceled']
                        },
                        error: {
                            type: 'object'
                        }
                    }
                }
            }
        }
    },
    apis: ['./controllers/*.ts', './controllers/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);