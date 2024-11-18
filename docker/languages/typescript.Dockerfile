FROM scriptorium-base:latest

USER root

# Install Node.js 18.x
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g typescript && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/coderunner/code && \
    chown -R coderunner:coderunner /home/coderunner/code

USER coderunner
WORKDIR /home/coderunner/code

# Create a tsconfig.json file
RUN echo '{ \
    "compilerOptions": { \
    "target": "ES2018", \
    "module": "CommonJS", \
    "strict": true, \
    "esModuleInterop": true, \
    "skipLibCheck": true, \
    "forceConsistentCasingInFileNames": true \
    } \
    }' > /home/coderunner/code/tsconfig.json

CMD ["bash", "-c", "tsc code.ts && node code.js < input.txt"] 