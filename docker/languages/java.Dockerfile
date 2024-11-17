FROM scriptorium-base:latest

USER root
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*
USER coderunner

WORKDIR /home/coderunner/code
CMD ["bash", "-c", "java Main.java"] 