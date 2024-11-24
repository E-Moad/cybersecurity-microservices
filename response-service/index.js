const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const kafka = require('kafka-node');

// Kafka Consumer Setup
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const consumer = new kafka.Consumer(client, [{ topic: 'incidents-topic' }], { autoCommit: true });

// Placeholder for automated responses
consumer.on('message', (message) => {
  const incident = JSON.parse(message.value);
  console.log(`Automated response for incident: ${incident.threatDescription}`);
});

// GraphQL Schema
const typeDefs = gql`
  type Response {
    message: String!
  }

  type Query {
    status: String!
  }
`;

const resolvers = {
  Query: {
    status: () => 'Response service running',
  },
};

// Start Server
const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

app.listen(4003, () => console.log('Response Service running on port 4003'));
