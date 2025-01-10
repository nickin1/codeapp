import { DockerExecutor } from '../../lib/dockerExecutor';

const dockerExecutor = new DockerExecutor();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, language, input } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Enable response streaming
    res.flushHeaders();

    const sendEvent = (type, data) => {
        res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
        // Force flush the response
        if (res.flush) {
            res.flush();
        }
    };

    try {
        // sendEvent('status', 'started');

        await dockerExecutor.executeCode(
            code,
            language,
            input,
            (type, data) => {
                sendEvent(type, data);
            }
        );

        // sendEvent('status', 'completed');
    } catch (error) {
        sendEvent('error', error.message);
    } finally {
        res.end();
    }
}
