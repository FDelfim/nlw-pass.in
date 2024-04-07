import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { BadRequest } from "./_errors/bad-request";

export async function registerForEvent(app : FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().post('/events/:eventId/attendees', {
        schema: {
            summary: 'Register for an event',
            tags: ['Attendees'],
            body: z.object({
                name: z.string().min(4).max(100),
                email: z.string().email(),
            }),
            params: z.object({
                eventId: z.string().uuid()
            }),
            response: {
                201: z.object({
                    attendeeId: z.number(),
                })
            }
        }
    }, async (request, reply) => {
        const { name, email } = request.body;
        const { eventId } = request.params;

        const attendeeFromEmail = await prisma.attendee.findUnique({
            where: {
                eventId_email: {
                    eventId,
                    email
                }
            }
        });

        if(attendeeFromEmail !== null){
            throw new Error('This e-mail is already registered for this event');
        }

        const [ event, amountOfAttendees ] = await Promise.all([
            prisma.event.findUnique({
                where: {
                    id: eventId
                }
            }),
            prisma.event.count({
                where: {
                    id: eventId
                }
            })
        ]);


        if(event?.maximumAttendees && amountOfAttendees >= event.maximumAttendees){
            throw new BadRequest('Event is already full');
        }

        const attendee = await prisma.attendee.create({
            data: {
                name,
                email,
                eventId
            }
        });

        return reply.status(201).send({attendeeId: attendee.id});
    })
}