// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

// Configurações do Swagger
const options = {
  definition: {
    openapi: '3.0.0', 
    info: {
      title: 'API - Filmes', 
      version: '1.0.0', 
      description: 'Documentação da API de Log de Filmes', 
    },
    servers: [
      {
        url: 'http://localhost:3000', 
      },
    ],
  },
  
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
