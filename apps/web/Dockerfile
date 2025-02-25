FROM node:23-alpine3.20 AS base
RUN mkdir /usr/app
RUN adduser -D -s /bin/bash nodejs
RUN chown -R nodejs /usr/app
RUN chmod ug+rwx /usr/app
USER nodejs

WORKDIR /usr/app
ENV PATH /usr/app/node_modules/.bin:$PATH

COPY --chown=nodejs package.json package-lock.json tsconfig.base.json /usr/app/
COPY --chown=nodejs shared /usr/app/shared/
COPY --chown=nodejs apps/web/package.json apps/web/tsconfig.json /usr/app/apps/web/
COPY --chown=nodejs apps/web/webpack.config.ts apps/web/tsconfig.json /usr/app/apps/web/
COPY --chown=nodejs apps/web/public /usr/app/apps/web/public/

RUN npm ci -ws apps/web,shared/common --include-workspace-root
COPY --chown=nodejs apps/web/src/ apps/web/src/

EXPOSE 3000
ENTRYPOINT ["npm", "run", "start:dev", "-w", "apps/web"]
