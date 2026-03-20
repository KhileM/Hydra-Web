// api/_shared/auth.js

export const AUTH_ENDPOINT = 'https://identity.hydra.africa/connect/token'

export function buildAuthBody(env = process.env) {
  return new URLSearchParams({
    client_id:     env.HYDRA_CLIENT_ID,
    client_secret: env.HYDRA_CLIENT_SECRET,
    grant_type:    'password',
    scope:         'api1',
    username:      env.HYDRA_USERNAME,
    password:      env.HYDRA_PASSWORD,
  })
}
