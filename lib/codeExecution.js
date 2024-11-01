import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { EventEmitter } from 'events';

const EXECUTION_TIMEOUT = 10000; // 10 seconds timeout
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
        this.tempDir = path.join(process.cwd(), 'temp');
        this.setupTempDirectory();
        this.activeProcesses = new Map();
    }

    async setupTempDirectory() {
        try {
            await fs.mkdir(this.tempDir, { recursive: true });
        } catch (error) {
            console.error('Error creating temp directory:', error);
        }
    }

    generateTempFilename(language) {
        const randomString = crypto.randomBytes(16).toString('hex');
        const extension = SUPPORTED_LANGUAGES[language].extension;
        return path.join(this.tempDir, `${randomString}.${extension}`);
    }

    async writeCodeToFile(code, filename) {
        await fs.writeFile(filename, code);
    }

    executeCommandWithStream(command, args, sessionId, input = '') {
        return new Promise((resolve, reject) => {

            const process = spawn(command, args, { shell: false });

            this.activeProcesses.set(sessionId, process);

            if (input) {
                process.stdin.write(input);
                process.stdin.end();
            }

            process.stdout.on('data', (data) => {
                this.emit('output', {
                    sessionId,
                    type: 'stdout',
                    data: data.toString()
                });
            });

            process.stderr.on('data', (data) => {
                this.emit('output', {
                    sessionId,
                    type: 'stderr',
                    data: data.toString()
                });
                console.log("got here", data.toString());
            });

            const timeout = setTimeout(() => {
                this.killProcess(sessionId);
                reject(new Error('Execution timed out'));
            }, EXECUTION_TIMEOUT);

            process.on('close', (code) => {
                clearTimeout(timeout);
                this.activeProcesses.delete(sessionId);
                this.emit('output', {
                    sessionId,
                    type: 'status',
                    data: code === 0 ? 'completed' : 'error',
                    code
                });
                console.log("exited with code ", code);
                resolve(code === 0);
            });

            process.on('error', (err) => {
                clearTimeout(timeout);
                this.activeProcesses.delete(sessionId);
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

    killProcess(sessionId) {
        const process = this.activeProcesses.get(sessionId);
        if (process) {
            process.kill();
            this.activeProcesses.delete(sessionId);
            this.emit('output', {
                sessionId,
                type: 'status',
                data: 'terminated'
            });
        }
    }

    async compileAndRunWithStream(filename, language, sessionId, input = '') {
        const langConfig = SUPPORTED_LANGUAGES[language];

        if (!langConfig.executeFile) {
            // Compilation needed
            try {
                this.emit('output', {
                    sessionId,
                    type: 'status',
                    data: 'compiling'
                });

                const compilationArgs = langConfig.compilationCommand(filename);
                const compilationSuccess = await this.executeCommandWithStream(langConfig.command, compilationArgs, `${sessionId}-compile`);

                // console.log(langConfig.command, compilationArgs);

                if (compilationSuccess) {

                    // Execute the compiled program
                    const executionCommand = langConfig.executionCommand(filename);

                    // await fs.access(compiledFilePath); // Check if compiled file exists
                    // await this.executeCommandWithStream('bash', ['-c', executionCommand], sessionId, input);
                    await this.executeCommandWithStream(executionCommand, [], sessionId, input);
                }
                else {
                    throw new Error("compilation failed.")
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
            // Interpreted languages
            try {
                await this.executeCommandWithStream(langConfig.command, [filename], sessionId, input);
            } catch (error) {
                this.emit('output', {
                    sessionId,
                    type: 'error',
                    data: error.message
                });
                throw error;
            }
        }
    }

    async cleanup(filename) {
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
        if (!SUPPORTED_LANGUAGES[language]) {
            throw new Error('Unsupported language');
        }

        const filename = await this.generateTempFilename(language);

        try {
            await this.writeCodeToFile(code, filename);
            await this.compileAndRunWithStream(filename, language, sessionId, input);
            await this.cleanup(filename);
        } catch (error) {
            await this.cleanup(filename);
            throw error;
        }
    }
}

export const codeExecutor = new CodeExecutor();

//code partially adapted from v0.dev