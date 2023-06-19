import Redis from "ioredis";

import env from "./env";

const client = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
  ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD })
});

export default client;

export const key = {
  link: (address: string, domain_id?: number, user_id?: number) =>
    `${env.REDIS_PREFIX}-${address}-${domain_id || ""}-${user_id || ""}`,
  domain: (address: string) => `${env.REDIS_PREFIX}-d-${address}`,
  stats: (link_id: number) => `${env.REDIS_PREFIX}-s-${link_id}`,
  host: (address: string) => `${env.REDIS_PREFIX}-h-${address}`,
  user: (emailOrKey: string) => `${env.REDIS_PREFIX}-u-${emailOrKey}`
};

export const remove = {
  domain: (domain?: Domain) => {
    if (!domain) return;
    return client.del(key.domain(domain.address));
  },
  host: (host?: Host) => {
    if (!host) return;
    return client.del(key.host(host.address));
  },
  link: (link?: Link) => {
    if (!link) return;
    return client.del(key.link(link.address, link.domain_id));
  },
  user: (user?: User) => {
    if (!user) return;
    return Promise.all([
      client.del(key.user(user.email)),
      client.del(key.user(user.apikey))
    ]);
  }
};
