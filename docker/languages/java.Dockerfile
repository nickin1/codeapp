FROM scriptorium-base:latest

USER root
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*
USER coderunner

WORKDIR /home/coderunner/code
CMD ["timeout", "10", "bash", "-c", "javac Main.java && java Main < input.txt"] 