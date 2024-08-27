const { Kafka } = require('kafkajs');
const kafka = new Kafka({ clientId: 'gps-consumer', brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'location-group' });

const startConsumer = async (io) => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'location', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const userId = message.key.toString();
            const location = JSON.parse(message.value.toString());

            // Log the message
            console.log(`Received location from ${userId}:`, location);

            // Emit the location update via WebSocket
            io.emit('location-update', { userId, location });
        },
    });
};

module.exports = { startConsumer };

