FROM scriptorium-base:latest

USER root
RUN apt-get update && apt-get install -y \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set proper permissions for the code directory
RUN mkdir -p /home/coderunner/code && \
    chown -R coderunner:coderunner /home/coderunner/code && \
    chmod 777 /home/coderunner/code

USER coderunner
WORKDIR /home/coderunner/code
CMD ["bash", "-c", "g++ -o program code.cpp && ./program"] 