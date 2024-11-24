const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const kafka = require('kafka-node');

// Kafka Consumer Setup
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const consumer = new kafka.Consumer(client, [{ topic: 'threats-topic' }], { autoCommit: true });

let incidents = [];

// GraphQL Schema
const typeDefs = gql`
  type Incident {
    id: ID!
    threatDescription: String!
    status: String!
    priority: String!
    createdAt: String!
  }

  type Query {
    incidents: [Incident!]!
  }

  type Mutation {
    updateIncidentStatus(id: ID!, status: String!): Incident!
  }
`;

const resolvers = {
  Query: {
    incidents: () => incidents,
  },
  Mutation: {
    updateIncidentStatus: (_, { id, status }) => {
      const incident = incidents.find((i) => i.id === id);
      if (incident) {
        incident.status = status;
      }
      return incident;
    },
  },
};

// Kafka Event Listener
consumer.on('message', (message) => {
  const threat = JSON.parse(message.value);
  const incident = {
    id: Date.now().toString(),
    threatDescription: threat.description,
    status: 'Open',
    priority: threat.severity === 'High' ? 'Critical' : 'Normal',
    createdAt: new Date().toISOString(),
  };
  incidents.push(incident);
});

// Start Server
const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

app.listen(4002, () => console.log('Incident Management running on port 4002'));
