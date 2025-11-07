// src/auth/jwt.ts
export function signUserJwt(fastify: any, userId: string) {
  return fastify.jwt.sign({ sub: userId }, { expiresIn: '7d' });
}
