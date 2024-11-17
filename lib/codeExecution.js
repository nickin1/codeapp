import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { EventEmitter } from 'events';

const EXECUTION_TIMEOUT = 10000; // 10 seconds timeout
const MEMORY_LIMIT_MB = 512; // Set memory limit to 512 MB
const SUPPORTED_LANGUAGES = {
    python: {
        extension: 'py',
        command: 'python3',
        executeFile: true
    },
    javascript: {
        extension: 'js',
        command: 'node',
        executeFile: true
    },
    cpp: {
        extension: 'cpp',
        command: 'g++',
        executeFile: false,
        compilationCommand: (filename) => [`${filename}`, '-o', `${filename.replace('.cpp', '')}`],
        executionCommand: (filename) => filename.replace('.cpp', '')
    },
    java: {
        extension: 'java',
        command: 'javac',
        executeFile: false,
        compilationCommand: (filename) => [filename],
        executionCommand: (filename) => {
            const className = path.basename(filename, '.java');
            return `java ${className}`;
        }
    },
    c: {
        extension: 'c',
        command: 'gcc',
        executeFile: false,
        compilationCommand: (filename) => [`${filename}`, '-o', `${filename.replace('.c', '')}`],
        executionCommand: (filename) => filename.replace('.c', '')
    }
};

class CodeExecutor extends EventEmitter {
    constructor() {
        super();
        console.log('Initializing CodeExecutor');
        this.tempDir = path.join(process.cwd(), 'temp');
        this.setupTempDirectory();
        this.activeProcesses = new Map();
    }

    async setupTempDirectory() {
        console.log('Setting up temp directory:', this.tempDir);
        try {
            await fs.mkdir(this.tempDir, { recursive: true });
            console.log('Temp directory created successfully');
        } catch (error) {
            console.error('Error creating temp directory:', error);
        }
    }

    generateTempFilename(language) {
        const randomString = crypto.randomBytes(16).toString('hex');
        const extension = SUPPORTED_LANGUAGES[language].extension;
        const filename = path.join(this.tempDir, `${randomString}.${extension}`);
        console.log('Generated temp filename:', filename);
        return filename;
    }

    async writeCodeToFile(code, filename) {
        console.log('Writing code to file:', filename);
        await fs.writeFile(filename, code);
        console.log('Code written successfully');
    }

    executeCommandWithStream(command, args, sessionId, input = '') {
        console.log('Executing command:', command, 'with args:', args, 'sessionId:', sessionId);
        if (input) console.log('Input provided:', input);

        return new Promise((resolve, reject) => {
            let output = '';
            let errorOutput = '';
            let isTerminated = false;

            // Convert MB to bytes for memory limit
            const memoryBytes = MEMORY_LIMIT_MB * 1024 * 1024;

            // Special handling for Node.js
            if (command === 'node') {
                args = [`--max-old-space-size=${MEMORY_LIMIT_MB}`, ...args];
            } else if (command.startsWith('java ')) {
                command = 'java';
                args = [`-Xmx${MEMORY_LIMIT_MB}m`, ...command.split(' ').slice(1), ...args];
            }

            const process = spawn(command, args, {
                shell: false,
                resourceLimits: {
                    maxMemory: memoryBytes, // Set max memory in bytes
                }
            });
            console.log('Process spawned with PID:', process.pid);

            this.activeProcesses.set(sessionId, process);

            // Handle input if provided
            if (input) {
                process.stdin.write(input);
                process.stdin.end();
            }

            // Set timeout
            const timeout = setTimeout(() => {
                console.log(`[${sessionId}] Process timed out after ${EXECUTION_TIMEOUT}ms`);
                isTerminated = true;
                this.killProcess(sessionId, 'time limit exceeded');
                reject(new Error('Execution timed out'));
            }, EXECUTION_TIMEOUT);

            process.stdout.on('data', (data) => {
                if (isTerminated) return;
                output += data.toString();
                console.log(`[${sessionId}] stdout:`, data.toString());
                this.emit('output', {
                    sessionId,
                    type: 'stdout',
                    data: data.toString()
                });
            });

            process.stderr.on('data', (data) => {
                if (isTerminated) return;
                errorOutput += data.toString();
                console.log(`[${sessionId}] stderr:`, data.toString());
                // Check if error is memory related
                const errorMsg = data.toString();
                if (errorMsg.includes('allocated memory') ||
                    errorMsg.includes('memory limit exceeded') ||
                    errorMsg.includes('std::bad_alloc') ||
                    errorMsg.includes('OutOfMemoryError')) {

                    // this.emit('output', {
                    //     sessionId,
                    //     type: 'error',
                    //     data: `Memory limit of ${MEMORY_LIMIT_MB}MB exceeded. Process terminated.`
                    // });
                    // this.killProcess(sessionId);
                    // reject(new Error('Memory limit exceeded'));
                    // return;

                    this.killProcess(sessionId, 'memory_limit');
                    reject(new Error('Memory limit exceeded'));
                    return;
                }

                this.emit('output', {
                    sessionId,
                    type: 'stderr',
                    data: errorMsg
                });
            });

            process.on('close', (code) => {
                console.log(`[${sessionId}] Process closed with code:`, code);
                console.log(`[${sessionId}] Final output:`, output);
                console.log(`[${sessionId}] Final error output:`, errorOutput);

                clearTimeout(timeout);
                this.activeProcesses.delete(sessionId);

                if (!isTerminated) {
                    this.emit('output', {
                        sessionId,
                        type: 'status',
                        data: code === 0 ? 'completed' : 'error',
                        code
                    });
                    resolve(code === 0);
                }
            });

            process.on('error', (err) => {
                if (isTerminated) return;
                console.log(`[${sessionId}] Process error:`, err.message);
                clearTimeout(timeout);
                this.activeProcesses.delete(sessionId);
                isTerminated = true;

                this.emit('output', {
                    sessionId,
                    type: 'error',
                    data: err.message
                });
                reject(err);
            });
        });
    }

    detectCompilationError(output) {
        const errorPattern = /error:/i; // Simple regex to check for "error:"
        return errorPattern.test(output);
    }

    killProcess(sessionId, reason = 'terminated') {
        console.log(`Attempting to kill process for session ${sessionId}, reason: ${reason}`);
        const process = this.activeProcesses.get(sessionId);
        if (process) {
            console.log(`Found active process for session ${sessionId}, killing it`);
            try {
                // Force kill after a short delay if SIGTERM doesn't work
                const killTimeout = setTimeout(() => {
                    try {
                        process.kill('SIGKILL');
                        console.log(`Sent SIGKILL to process ${sessionId}`);
                    } catch (e) {
                        console.error(`Error sending SIGKILL to process ${sessionId}:`, e);
                    }
                }, 1000);

                process.kill('SIGTERM');
                console.log(`Successfully sent SIGTERM to process ${sessionId}`);

                // Clear kill timeout if process ends naturally
                process.on('exit', () => {
                    clearTimeout(killTimeout);
                });
            } catch (error) {
                console.error(`Error killing process ${sessionId}:`, error);
            }
            this.activeProcesses.delete(sessionId);
            this.emit('output', {
                sessionId,
                type: 'status',
                data: reason,
                details: reason === 'memory_limit' ?
                    `Process terminated: Memory limit of ${MEMORY_LIMIT_MB}MB exceeded` :
                    `Process terminated: ${reason}`
            });
        } else {
            console.log(`No active process found for session ${sessionId}`);
        }
    }

    async compileAndRunWithStream(filename, language, sessionId, input = '') {
        console.log(`Compiling and running ${language} file:`, filename);
        const langConfig = SUPPORTED_LANGUAGES[language];

        if (!langConfig.executeFile) {
            console.log('Compilation needed for', language);
            try {
                this.emit('output', {
                    sessionId,
                    type: 'status',
                    data: 'compiling'
                });

                const compilationArgs = langConfig.compilationCommand(filename);
                const compilationSuccess = await this.executeCommandWithStream(langConfig.command, compilationArgs, `${sessionId}-compile`);

                if (compilationSuccess) {
                    console.log('Compilation successful, executing program');
                    const executionCommand = langConfig.executionCommand(filename);

                    // Don't emit completion status until the program actually finishes
                    return await this.executeCommandWithStream(executionCommand, [], sessionId, input);
                } else {
                    throw new Error("compilation failed.");
                }
            } catch (error) {
                if (error.message !== "compilation failed.") {
                    this.emit('output', {
                        sessionId,
                        type: 'error',
                        data: error.message
                    });
                }
                throw error;
            }
        } else {
            // For interpreted languages
            return await this.executeCommandWithStream(langConfig.command, [filename], sessionId, input);
        }
    }

    async cleanup(filename) {
        console.log('Cleaning up files:', filename);
        try {
            await fs.unlink(filename);
            // Clean up compiled files for C/C++
            const compiledFile = filename.replace(/\.(cpp|c)$/, '');
            await fs.unlink(compiledFile).catch(() => { }); // Ignore if file doesn't exist
        } catch (error) {
            console.error('Error cleaning up files:', error);
        }
    }

    async executeWithStream(code, language, sessionId, input = '') {
        console.log(`Executing ${language} code for session ${sessionId}`);
        if (!SUPPORTED_LANGUAGES[language]) {
            throw new Error('Unsupported language');
        }

        const filename = await this.generateTempFilename(language);

        try {
            await this.writeCodeToFile(code, filename);
            // Wait for the execution to complete before cleaning up
            const result = await this.compileAndRunWithStream(filename, language, sessionId, input);
            console.log('Execution completed, cleaning up');
            await this.cleanup(filename);
            return result;
        } catch (error) {
            console.error('Execution failed:', error);
            await this.cleanup(filename);
            throw error;
        }
    }
}

export const codeExecutor = new CodeExecutor();

//code partially adapted from v0.dev