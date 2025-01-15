import Docker from 'dockerode';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export class DockerExecutor {
    private docker: Docker;
    private tempDir: string;

    constructor() {
        console.log('Initializing DockerExecutor');
        this.docker = new Docker();
        this.tempDir = path.join(process.cwd(), 'temp');
        console.log('Temp directory set to:', this.tempDir);
    }

    async executeCode(
        code: string,
        language: string,
        input: string = '',
        onOutput?: (type: 'stdout' | 'stderr' | 'status', data: string) => void
    ): Promise<{ stdout: string, stderr: string, stats: { memoryUsage: number, cpuUsage: number, execTime: number } }> {
        const containerId = crypto.randomBytes(16).toString('hex');

        const tempPath = path.join(this.tempDir, containerId);

        const imageName = `scriptorium-${language}:latest`;

        const startTime = process.hrtime();

        try {
            // Check if image exists
            console.log('Checking if Docker image exists...');
            try {
                await this.docker.getImage(imageName).inspect();
                console.log('Docker image found');
            } catch (error) {
                console.error('Docker image not found:', error);
                throw new Error(`Server error, please try again later.`);
            }

            await fs.mkdir(tempPath, { recursive: true });

            await fs.chmod(tempPath, 0o777);

            const filename = language === 'java' ? 'Main.java' : `code.${this.getFileExtension(language)}`;
            const codeFile = path.join(tempPath, filename);
            console.log('Writing code to file:', codeFile);
            await fs.writeFile(codeFile, code);

            if (input) {
                const inputFile = path.join(tempPath, 'input.txt');
                await fs.writeFile(inputFile, input);
            }
            else {
                const inputFile = path.join(tempPath, 'input.txt');
                await fs.writeFile(inputFile, '');
            }

            const container = await this.docker.createContainer({
                Image: imageName,
                name: containerId,
                HostConfig: {
                    Binds: [`${tempPath}:/home/coderunner/code:Z`],
                    Memory: 256 * 1024 * 1024,
                    MemorySwap: 256 * 1024 * 1024,
                    CpuPeriod: 100000,
                    CpuQuota: 90000,
                    NetworkMode: 'none',
                    PidsLimit: 150,
                },
                WorkingDir: '/home/coderunner/code',
                Tty: false,
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                OpenStdin: true,
                StdinOnce: true,
                User: 'coderunner'
            });

            await container.start();

            console.log('Attaching to container...');
            const stream = await container.attach({
                stream: true,
                stdout: true,
                stderr: true,
                stdin: input ? true : false
            });
            console.log('Successfully attached to container');

            if (input) {
                stream.write(input + '\n');
            }

            let stdout = '';
            let stderr = '';

            return new Promise(async (resolve, reject) => {
                console.log('Starting execution promise...');

                const timeoutId = setTimeout(async () => {
                    console.log('Execution timeout reached');
                    try {
                        await container.kill({ signal: 'SIGTERM' });
                    } catch (error) {
                        console.error('Error killing container:', error);
                    }
                }, 10000);

                let buffer = Buffer.alloc(0);

                // Add a stream end promise
                const streamEndPromise = new Promise<void>((resolveStream) => {
                    stream.on('end', () => {
                        resolveStream();
                    });
                });

                stream.on('data', (chunk: Buffer) => {
                    buffer = Buffer.concat([buffer, chunk]);

                    while (buffer.length >= 8) { // Minimum frame size is 8 bytes (header)
                        const frameHeader = buffer.slice(0, 8);
                        const streamType = frameHeader[0];
                        const frameSize = frameHeader.readUInt32BE(4); // Last 4 bytes contain the size

                        // Check if we have a complete frame
                        if (buffer.length < 8 + frameSize) {
                            break; // Wait for more data
                        }

                        // Extract the frame payload
                        const frameContent = buffer.slice(8, 8 + frameSize).toString('utf8');

                        // Update the buffer to remove the processed frame
                        buffer = buffer.slice(8 + frameSize);

                        // Handle the frame content
                        if (streamType === 1) {
                            stdout += frameContent;
                            if (onOutput) {
                                onOutput('stdout', frameContent);
                            }
                        } else if (streamType === 2) {
                            stderr += frameContent;
                            if (onOutput) {
                                onOutput('stderr', frameContent);
                            }
                        }
                        console.log(`Stream type ${streamType}, content: ${frameContent}`);
                    }
                });

                stream.on('error', (error) => {
                    console.error('Stream error:', error);
                    if (onOutput) {
                        onOutput('stderr', error.message);
                    }
                    stderr += error.message;
                });

                container.wait(async (error, result) => {
                    console.log('Container execution finished, result:', result);
                    clearTimeout(timeoutId);

                    if (error) {
                        console.error('Container wait error:', error);
                        reject(error);
                        return;
                    }

                    // Wait for stream to finish before proceeding
                    await streamEndPromise;

                    // 137 = Container killed by OOM killer (128 + SIGKILL(9))
                    // 139 = Segmentation fault (128 + SIGSEGV(11))
                    // 134 = Abort (128 + SIGABRT(6))
                    const exitCode = result?.StatusCode;
                    let terminationReason = '';

                    switch (exitCode) {
                        case 137:
                            terminationReason = `Process terminated: Memory limit exceeded (256MB)`;
                            break;
                        case 124:
                            terminationReason = `Process terminated: Execution timeout (10s)`;
                            break;
                        case 139:
                            terminationReason = `Process terminated: Segmentation fault`;
                            break;
                        case 134:
                            terminationReason = `Process terminated: Program aborted`;
                            break;
                        case 0:
                            terminationReason = `Process completed successfully`;
                            break;
                        default:
                            terminationReason = `Process terminated with exit code ${exitCode}`;
                    }

                    console.log(`Container exit code: ${exitCode}, reason: ${terminationReason}`);

                    if (onOutput) {
                        onOutput('status', terminationReason);
                    }

                    try {
                        const endTime = process.hrtime(startTime);
                        const execTime = endTime[0] + endTime[1] / 1e9;  // Convert to seconds

                        // Get logs before removal
                        const logs = await container.logs({
                            stdout: true,
                            stderr: true,
                            timestamps: true
                        });

                        // Log everything
                        console.log('Exit code:', result.StatusCode);
                        console.log('Container logs:', logs.toString());
                        console.log('Execution time:', execTime.toFixed(3) + 's');

                        // Then remove
                        await container.remove({ force: true });
                        await fs.rm(tempPath, { recursive: true });

                        resolve({
                            stdout,
                            stderr,
                            stats: {
                                memoryUsage: 0,
                                cpuUsage: 0,
                                execTime
                            }
                        });
                    } catch (cleanupError) {
                        console.error('Cleanup error:', cleanupError);
                        resolve({ stdout, stderr, stats: { memoryUsage: 0, cpuUsage: 0, execTime: 0 } });
                    }
                });
            });
        } catch (error) {
            console.error('Execution error:', error);
            return Promise.reject(error)
        }
    }

    private getFileExtension(language: string): string {
        console.log('Getting file extension for language:', language);
        const extensions: { [key: string]: string } = {
            python: 'py',
            javascript: 'js',
            typescript: 'ts',
            cpp: 'cpp',
            c: 'c',
            java: 'java',
            rust: 'rs',
            go: 'go',
            racket: 'rkt',
            ruby: 'rb'
        };
        const extension = extensions[language] || language;
        console.log('Using file extension:', extension);
        return extension;
    }
} 