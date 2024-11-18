FROM scriptorium-base:latest

USER root
RUN apt-get update && apt-get install -y \
    rustc \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/coderunner/code && \
    chown -R coderunner:coderunner /home/coderunner/code

USER coderunner
WORKDIR /home/coderunner/code
CMD ["bash", "-c", "rustc code.rs -o program && ./program < input.txt"] 