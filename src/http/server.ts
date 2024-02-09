import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { fastifyWebsocket } from '@fastify/websocket'
import { createPolls } from './routes/create-poll'
import { getPolls } from './routes/get-poll'
import { voteOnPoll } from './routes/vote-on-poll'
import { pollReults } from './ws/poll-results'

const app = fastify()

app.register(cookie, {
  secret: 'secret',
  hook: 'onRequest',
})

app.register(fastifyWebsocket)
app.register(createPolls)
app.register(getPolls)
app.register(voteOnPoll)
app.register(pollReults)

app.listen({ port: 3333 }).then(() => {
  console.log('runnig')
})
