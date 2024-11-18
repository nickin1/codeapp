FROM scriptorium-base:latest

USER root
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*
USER coderunner

WORKDIR /home/coderunner/code
# Modified to handle input redirection
CMD ["bash", "-c", "python3 -u code.py < input.txt"] 