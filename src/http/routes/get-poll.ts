import z, { number } from 'zod'
import { prisma } from '../../lib/prisma'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { redis } from '../../lib/redis'

export const getPolls = async (app: FastifyInstance) => {
  app.get(
    '/polls/:pollId',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const createPollParams = z.object({
        pollId: z.string().uuid(),
      })

      const { pollId } = createPollParams.parse(req.params)

      const poll = await prisma.poll.findUnique({
        where: {
          id: pollId,
        },
        include: {
          pollOptions: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      })

      if (!poll) return reply.status(400).send({ message: 'Poll not found.' })

      const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES')

      const votes = result.reduce((obj, line, index) => {
        if (index % 2 === 0) {
          const score = result[index + 1]

          Object.assign(obj, { [line]: score })
        }

        return obj
      }, {} as Record<string, number>)

      return reply.status(200).send({
        poll: {
          ...poll,
          pollOptions: poll.pollOptions.map((option) => ({
            ...option,
            score: option.id in votes ? Number(votes[option.id]) : 0,
          })),
        },
      })
    },
  )
}
