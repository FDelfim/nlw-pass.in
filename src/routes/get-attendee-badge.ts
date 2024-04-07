import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { BadRequest } from "./_errors/bad-request";

export async function getAttendeeBadge(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/attendees/:attendeeId/badge', {
        schema: {
            summary: 'Get attendee badge',
            tags: ['Attendees'],
            params: z.object({
                attendeeId: z.coerce.number().int(),
            }),
            reponse: {
                200: {
                    badge: z.object({
                        name: z.string(),
                        email: z.string().email(),
                        eventName: z.string(),
                        checkInUrl: z.string().url()
                    })
                }
            }
        },
    }, async (request, reply) => {
        const { attendeeId } = request.params;
        const attendee = await prisma.attendee.findUnique({
            select: {
                name: true,
                email: true,
                event: {
                    select: {
                        title: true
                    }
                }
            },
            where: {
                id: attendeeId
            }
        });

        if (attendee === null) {
            throw new BadRequest('Attendee not found');
        }

        const baseUrl = request.protocol + '://' + request.hostname;

        const checkInUrl = new URL(`/attendees/${attendeeId}/check-in`, baseUrl);

        reply.status(200).send({
            badge: {
                name: attendee.name,
                email: attendee.email,
                eventName: attendee.event.title,
                checkInUrl: checkInUrl.toString()
            }
        });
    })
}