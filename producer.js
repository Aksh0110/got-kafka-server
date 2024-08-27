const { Kafka } = require('kafkajs');
const kafka = new Kafka({ clientId: 'gps-producer', brokers: ['localhost:9092'] });
const producer = kafka.producer();

const startProducer = async () => {
    await producer.connect();
};

const sendMessage = async (userId, location) => {
    await producer.send({
        topic: 'location',
        messages: [
            { key: userId, value: JSON.stringify(location) }
        ],
    });
};

module.exports = { startProducer, sendMessage };

