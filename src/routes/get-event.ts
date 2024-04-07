import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { BadRequest } from "./_errors/bad-request";

export async function getEvent(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/events/:eventId', {
        schema: {
            summary: 'Get an event',
            tags: ['Events'],
            params: z.object({
                eventId: z.string().uuid()
            }),
            reponse: {
                200: {
                    event: z.object({
                        id: z.string().uuid(),
                        title: z.string(),
                        details: z.string().nullable(),
                        maximumAttendees: z.number().int().positive().nullable(),
                        slug: z.string(),
                        attendeesAmount: z.number().int().positive()
                    })
                }
            }
        }
    }, async(request, reply) => {
        const { eventId } = request.params;

        const event = await prisma.event.findUnique({
            select: {
                id: true, title: true, details: true, maximumAttendees: true, slug: true,
                _count: {
                    select: {attendees: true}
                }
            },
            where: {
                id: eventId
            }
        });

        if(event === null){
            throw new BadRequest('Event not found');
        }

        return reply.status(200).send({
            event: {
                id: event.id,
                title: event.title,
                details: event.details,
                maximumAttendees: event.maximumAttendees,
                slug: event.slug,
                attendeesAmount: event._count.attendees
            }
        });
    })
}