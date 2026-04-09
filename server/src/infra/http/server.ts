import { env } from '@/env'
import { createLinkRoute } from '@/infra/http/routes/create-link'
import { deleteLinkRoute } from '@/infra/http/routes/delete-link'
import { exportLinksToCsvRoute } from '@/infra/http/routes/export-links-to-csv'
import { getLinksRoute } from '@/infra/http/routes/get-links'
import { getOriginalUrlRoute } from '@/infra/http/routes/get-original-url'
import { incrementLinkAccessRoute } from '@/infra/http/routes/increment-link-access'
import { transformSwaggerSchema } from '@/infra/http/routes/transform-swagger-schema'
import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

const server = fastify({ logger: true })

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, _request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Erro de validação',
      issues: error.validation,
    })
  }

  server.log.error(error)

  return reply.status(500).send({
    message: 'Ocorreu um erro inesperado',
  })
})

server.register(fastifyCors, {
  origin: '*',
  // Padrão do plugin é só GET,HEAD,POST — sem isso o browser bloqueia DELETE/PUT em origem cruzada (ex.: Vite :5173 → API :3333).
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
})

server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Brev Server API',
      version: '1.0.0',
    },
  },
  transform: transformSwaggerSchema,
})

server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

server.register(getLinksRoute)
server.register(createLinkRoute)
server.register(deleteLinkRoute)
server.register(getOriginalUrlRoute)
server.register(incrementLinkAccessRoute)
server.register(exportLinksToCsvRoute)

server.get('/', () => {
  return 'Hello World'
})

server
  .listen({ port: env.PORT, host: '0.0.0.0' })
  .then(() => {
    server.log.info(`Server listening on port ${env.PORT}`)
  })
  .catch(err => {
    server.log.error(err)
    process.exit(1)
  })
