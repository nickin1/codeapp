FROM scriptorium-base:latest

USER root
RUN apt-get update && apt-get install -y \
    python3 \
    && rm -rf /var/lib/apt/lists/*
USER coderunner

WORKDIR /home/coderunner/code
CMD ["timeout", "10", "bash", "-c", "python3 -u code.py < input.txt"]