FROM cloudron/base:3.0.0@sha256:455c70428723e3a823198c57472785437eb6eab082e79b3ff04ea584faf46e92

WORKDIR /app/code

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update -y && \
    apt-get install -y software-properties-common libcurl4 openssl liblzma5 && \
    rm -r /var/cache/apt /var/lib/apt/lists

ARG MONGO_VERSION=5.0.2
ARG MONGO_INSTALL_DIR=/app/code/mongo
RUN mkdir -p "${MONGO_INSTALL_DIR}/conf" \
    && curl -Ls "https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2004-${MONGO_VERSION}.tgz" | tar -xz --directory "${MONGO_INSTALL_DIR}" --strip-components=1 --no-same-owner

ARG MONGO_DATA_DIR=/app/data
ARG CODE_DIR=/app/code
RUN mkdir -p ${MONGO_DATA_DIR}/db ${MONGO_DATA_DIR}/log

COPY start.sh ${CODE_DIR}/
COPY frontend/ ${CODE_DIR}/frontend
COPY mongod.conf ${MONGO_DATA_DIR}/
COPY supervisor/* /etc/supervisor/conf.d/
RUN ln -sf /run/supervisord.log /var/log/supervisor/supervisord.log

RUN npm install --prefix ${CODE_DIR}/frontend

RUN chown -R cloudron:cloudron ${MONGO_DATA_DIR}

CMD [ "/app/code/start.sh" ]