FROM scriptorium-base:latest

USER root
RUN apt-get update && apt-get install -y \
    golang \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/coderunner/code && \
    chown -R coderunner:coderunner /home/coderunner/code

USER coderunner
WORKDIR /home/coderunner/code
CMD ["bash", "-c", "go build -o program code.go && ./program < input.txt"] 