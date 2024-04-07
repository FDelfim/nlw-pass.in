import { FastifyInstance } from "fastify";
import { BadRequest } from "./routes/_errors/bad-request";
import { ZodError } from "zod";

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const ErrorHandler: FastifyErrorHandler = (error, request, reply) => {

    if(error instanceof ZodError){
        return reply.status(400).send({
            message: `Error during validation`,
            details: error.flatten().fieldErrors
        });
    }

    if(error instanceof BadRequest){
        reply.status(400).send({message: error.message});
    }

    return reply.status(500).send({message: 'Internal server error'});
}