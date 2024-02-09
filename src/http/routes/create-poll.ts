import z from 'zod'
import { prisma } from '../../lib/prisma'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export const createPolls = async (app: FastifyInstance) => {
  app.post('/polls', async (req: FastifyRequest, reply: FastifyReply) => {
    const createPollBody = z.object({
      title: z.string(),
      options: z.array(z.string()),
    })

    const { title, options } = createPollBody.parse(req.body)

    const poll = await prisma.poll.create({
      data: {
        title,
        pollOptions: {
          createMany: {
            data: options.map((option) => {
              return {
                title: option,
              }
            }),
          },
        },
      },
    })

    return reply.status(201).send({ poll })
  })
}
