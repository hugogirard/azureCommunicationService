import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    sender: string;
    communicationConnectionString: string;
}

const config: Config = {
    port: Number(process.env.PORT) || 3000,
    sender: String(process.env.SENDER),
    communicationConnectionString: String(process.env.COMMUNICATION_SERVICES_CONNECTION_STRING)
}

export default config;