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
COPY --chown=nodejs services/api/package.json services/api/tsconfig.json /usr/app/services/api/
RUN npm ci -ws services/api,shared --include-workspace-root
COPY --chown=nodejs services/api/src/ services/api/src/

RUN npm run build -w services/api
EXPOSE 8080
ENTRYPOINT ["npm", "run", "start:dev", "-w", "services/api"]
