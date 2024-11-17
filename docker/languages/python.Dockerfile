FROM scriptorium-base:latest

USER root
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*
USER coderunner

WORKDIR /home/coderunner
# Set the command to run Python scripts
CMD ["python3", "-u", "code.py"] 