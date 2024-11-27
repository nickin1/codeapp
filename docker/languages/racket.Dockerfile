FROM scriptorium-base:latest

USER root
RUN apt-get update && apt-get install -y \
    racket \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/coderunner/code && \
    chown -R coderunner:coderunner /home/coderunner/code

USER coderunner
WORKDIR /home/coderunner/code
CMD ["timeout", "10", "bash", "-c", "stdbuf -o0 racket code.rkt < input.txt"] 