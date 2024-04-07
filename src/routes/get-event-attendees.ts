import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export async function getEventAttendees(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/events/:eventId/attendees', {
        schema: {
            summary: 'Get event attendees',
            tags: ['Events'],
            params: z.object({
                eventId: z.string().uuid()
            }),
            querystring: z.object({
                pageIndex: z.string().default('0').nullable().transform(Number),
                query: z.string().nullish()
            }),
            reponse: {
                200: z.object({
                    attendees: z.array(z.object({
                        id: z.string().uuid(),
                        name: z.string(),
                        email: z.string().email(),
                        createdAt: z.date(),
                        checkInAt: z.date().nullable(),
                    })),
                    total: z.number()
                })
            }
        }
    }, async(request, reply) => {
        const { eventId } = request.params;
        const { pageIndex } = request.query;
        const { query } = request.query;

        const total = await prisma.attendee.count({
            where: query ? {
                eventId,
                name: {
                    contains: query
                }
            } : {
                eventId  
            },
        });

        const attendees = await prisma.attendee.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                checkIn: {
                    select: {
                        createdAt: true
                    }
                }
            },
            where: query ? {
                eventId,
                name: {
                    contains: query
                }
            } : {
                eventId  
            },
            take: 10,
            skip: pageIndex * 10,
            orderBy: {
                createdAt: 'desc'
            }
        });

        reply.send({
            attendees: attendees.map(attendee => ({
                id: attendee.id,
                name: attendee.name,
                email: attendee.email,
                createdAt: attendee.createdAt,
                checkInAt: attendee.checkIn?.createdAt ?? null,
            })),
            total: total
        })
    })
}