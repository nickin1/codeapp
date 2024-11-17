FROM scriptorium-base:latest

USER root
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*
USER coderunner

WORKDIR /home/coderunner/code
CMD ["node", "code.js"] 