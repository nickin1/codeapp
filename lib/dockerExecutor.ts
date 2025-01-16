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
        let stdout = '';
        let stderr = '';
        let containerId: string | null = null;
        const startTime = Date.now();

        try {
            // Generate unique container ID
            containerId = crypto.randomBytes(16).toString('hex');
            console.log('Generated container ID:', containerId);

            const tempPath = path.join(this.tempDir, containerId);
            console.log('Created temp path:', tempPath);

            const imageName = `scriptorium-${language}:latest`;
            console.log('Using Docker image:', imageName);

            // Check if Docker image exists
            try {
                await this.docker.getImage(imageName).inspect();
                console.log('Docker image found');
            } catch (error) {
                console.error('Docker image not found:', error);
                throw new Error(`Server error, please try again later.`);
            }

            // Create temp directory for this execution
            await fs.mkdir(tempPath, { recursive: true });
            console.log('Temp directory created successfully');

            // Set full permissions on temp directory
            await fs.chmod(tempPath, 0o777);

            // Write code file with special handling for Java
            const filename = language === 'java' ? 'Main.java' : `code.${this.getFileExtension(language)}`;
            const codeFile = path.join(tempPath, filename);
            console.log('Writing code to file:', codeFile);
            await fs.writeFile(codeFile, code);

            // Write input file
            const inputFile = path.join(tempPath, 'input.txt');
            await fs.writeFile(inputFile, input || '');
            console.log(`Input file written to: ${input ? inputFile : 'empty input file'}`);

            // Create container
            console.log('Creating Docker container...');
            const container = await this.docker.createContainer({
                Image: imageName,
                name: containerId,
                HostConfig: {
                    Binds: [`${tempPath}:/home/coderunner/code:Z`],
                    Memory: 512 * 1024 * 1024,
                    MemorySwap: 512 * 1024 * 1024,
                    CpuPeriod: 100000,
                    CpuQuota: 90000,
                    NetworkMode: 'none',
                    PidsLimit: 150
                },
                WorkingDir: '/home/coderunner/code',
                Tty: false,
                AttachStdin: input ? true : false,
                AttachStdout: true,
                AttachStderr: true,
                OpenStdin: true,
                StdinOnce: true,
                User: 'coderunner'
            });
            console.log('Container created successfully');

            // Attach to container **before** starting it
            console.log('Attaching to container before starting...');
            const stream = await container.attach({
                stream: true,
                stdout: true,
                stderr: true,
                stdin: input ? true : false,
                hijack: true // Ensure proper stream handling
            });
            console.log('Successfully attached to container');

            // Start container after attaching
            await container.start();
            console.log('Container started successfully');

            // Send input if provided
            if (input) {
                console.log('Sending input to container...');
                stream.write(input + '\n');
                // To avoid closing the entire stream, only end the stdin part
                // by signaling EOF for stdin without affecting stdout/stderr
                (stream as any).end(); // `dockerode` uses Duplex streams
                console.log('Input sent successfully');
            }

            // Handle streaming output
            const streamPromise = new Promise<void>((resolve, reject) => {
                let buffer = Buffer.alloc(0);

                stream.on('data', (chunk: Buffer) => {
                    buffer = Buffer.concat([buffer, chunk]);

                    while (buffer.length >= 8) { // Minimum frame size is 8 bytes (header)
                        const frameHeader = buffer.slice(0, 8);
                        const streamType = frameHeader[0];
                        const frameSize = frameHeader.readUInt32BE(4); // Last 4 bytes contain the size

                        if (buffer.length < 8 + frameSize) {
                            break; // Wait for more data
                        }

                        const frameContent = buffer.slice(8, 8 + frameSize).toString('utf8');
                        buffer = buffer.slice(8 + frameSize);

                        if (streamType === 1) { // stdout
                            stdout += frameContent;
                            if (onOutput) {
                                onOutput('stdout', frameContent);
                            }
                        } else if (streamType === 2) { // stderr
                            stderr += frameContent;
                            if (onOutput) {
                                onOutput('stderr', frameContent);
                            }
                        }
                        console.log(`Stream type ${streamType}, content: ${frameContent}`);
                    }
                });

                stream.on('end', resolve);
                stream.on('error', reject);
            });

            // Wait for both the stream to finish and the container to exit
            const waitPromise = container.wait().then((result) => {
                console.log('Container execution finished, result:', result);
                // Handling exit codes
                const exitCode = result.StatusCode;
                let terminationReason = '';

                switch (exitCode) {
                    case 137:
                        terminationReason = `Process terminated: Memory limit exceeded (512MB)`;
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

                return result;
            });

            await Promise.all([
                streamPromise,
                waitPromise
            ]);
            console.log('Both stream and container wait have completed');

            // Get container stats
            const stats = await container.stats({ stream: false });
            const memoryUsage = stats.memory_stats.usage / (1024 * 1024); // Convert to MB
            const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
            const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
            const cpuUsage = systemDelta > 0 ? (cpuDelta / systemDelta) * 100 : 0;
            const execTime = (Date.now() - startTime) / 1000; // Convert to seconds

            console.log('Execution time:', execTime, 'seconds');
            console.log('Memory usage:', memoryUsage, 'MB');
            console.log('CPU usage:', cpuUsage, '%');

            return {
                stdout,
                stderr,
                stats: {
                    memoryUsage,
                    cpuUsage,
                    execTime
                }
            };
        } catch (error) {
            console.error('Error executing code:', error);
            throw error;
        } finally {
            if (containerId) {
                try {
                    const container = this.docker.getContainer(containerId);
                    await container.remove({ force: true });
                    console.log('Container removed successfully');
                } catch (error) {
                    console.error('Error cleaning up container:', error);
                }
            }
            // Cleanup temp directory
            try {
                await fs.rm(path.join(this.tempDir, containerId || ''), { recursive: true, force: true });
                console.log('Temporary directory cleaned up');
            } catch (cleanupError) {
                console.error('Error cleaning up temp directory:', cleanupError);
            }
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