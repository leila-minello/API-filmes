const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'API de Log de Filmes - CartaCaixa',
        description:'Documentação da API usando Swagger Autogen'
    },

    host: 'localhost:3000',
    schemes: ['http'],
    securityDefinitions: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
        },
    },

    security: [{ bearerAuth: [] }],
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./app');
});