import fastify from 'fastify';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod'
import { fastifyCors } from '@fastify/cors';

import { createEvent } from './routes/create-envent';
import { registerForEvent } from './routes/register-for-event';
import { getEvent } from './routes/get-event';
import { getAttendeeBadge } from './routes/get-attendee-badge';
import { checkIn } from './routes/check-in';
import { getEventAttendees } from './routes/get-event-attendees';
import { ErrorHandler } from './error-handler';


const app = fastify();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
    origin: '*'
})

app.register(fastifySwagger, {
    swagger:{
        consumes: ['application/json'],
        produces: ['application/json'],
        info: {
            title: 'Pass.in',
            description: 'Especificações da API desevolvida no NLW Unite',
            version: '1.0.0'
        },
    },
    transform: jsonSchemaTransform
})

app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
})

app.register(createEvent);
app.register(registerForEvent);
app.register(getEvent);
app.register(getAttendeeBadge);
app.register(checkIn);
app.register(getEventAttendees);

app.setErrorHandler(ErrorHandler);

app.listen({port: 8000, host: '0.0.0.0'}).then(() => {
    console.log('Server is running on port 8000');
})