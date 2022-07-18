FROM cloudron/base:3.2.0@sha256:ba1d566164a67c266782545ea9809dc611c4152e27686fd14060332dd88263ea

ARG MONGO_VERSION=5.0.2
ARG MONGO_INSTALL_DIR=/app/code/mongo
ARG MONGO_DATA_DIR=/app/data
ARG CODE_DIR=/app/code

ENV DEBIAN_FRONTEND noninteractive

WORKDIR /app/code

RUN apt-get update -y && \
    apt-get install -y software-properties-common libcurl4 openssl liblzma5 && \
    rm -r /var/cache/apt /var/lib/apt/lists


RUN mkdir -p "${MONGO_INSTALL_DIR}/conf" \
    && curl -Ls "https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2004-${MONGO_VERSION}.tgz" | tar -xz --directory "${MONGO_INSTALL_DIR}" --strip-components=1 --no-same-owner

RUN mkdir -p ${MONGO_DATA_DIR}/db ${MONGO_DATA_DIR}/log

COPY start.sh ${CODE_DIR}/
COPY api/ ${CODE_DIR}/api
COPY mongod.conf ${MONGO_DATA_DIR}/
COPY supervisor/* /etc/supervisor/conf.d/

RUN ln -sf /run/supervisord.log /var/log/supervisor/supervisord.log

RUN npm install --prefix ${CODE_DIR}/api

RUN chown -R cloudron:cloudron ${MONGO_DATA_DIR}

CMD [ "/app/code/start.sh" ]