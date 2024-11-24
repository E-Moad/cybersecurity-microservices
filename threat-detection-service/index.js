const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const kafka = require('kafka-node');

// Kafka Producer Setup
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new kafka.Producer(client);

// GraphQL Schema
const typeDefs = gql`
  type Threat {
    id: ID!
    description: String!
    severity: String!
    detectedAt: String!
  }

  type Query {
    threats: [Threat!]!
  }

  type Mutation {
    addThreat(description: String!, severity: String!): Threat!
  }
`;

let threats = [];

const resolvers = {
  Query: {
    threats: () => threats,
  },
  Mutation: {
    addThreat: (_, { description, severity }) => {
      const threat = {
        id: Date.now().toString(),
        description,
        severity,
        detectedAt: new Date().toISOString(),
      };
      threats.push(threat);

      // Publish event to Kafka
      producer.send(
        [{ topic: 'threats-topic', messages: JSON.stringify(threat) }],
        (err) => {
          if (err) console.error('Failed to send message:', err);
        }
      );
      return threat;
    },
  },
};

// Start Server
const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app });

app.listen(4001, () => console.log('Threat Detection running on port 4001'));
