import { codeExecutor } from '../../lib/codeExecution';
import crypto from 'crypto';

export const config = {
    api: {
        responseLimit: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, language, input } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'Code and language are required' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Generate unique session ID
    const sessionId = crypto.randomBytes(16).toString('hex');

    // Setup SSE event handlers
    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        res.flush();
    };

    const outputHandler = (output) => {
        if (output.sessionId === sessionId || output.sessionId === `${sessionId}-compile`) {
            sendEvent(output);
            if (output.type === 'status' && ['completed', 'error', 'terminated'].includes(output.data)) {
                cleanup();
            }
        }
    };

    const cleanup = () => {
        codeExecutor.removeListener('output', outputHandler);
        res.end();
    };

    // Register event listener
    codeExecutor.on('output', outputHandler);

    // Handle client disconnect
    res.on('close', () => {
        codeExecutor.killProcess(sessionId);
        cleanup();
    });

    try {
        await codeExecutor.executeWithStream(code, language, sessionId, input);
    } catch (error) {
        sendEvent({
            sessionId,
            type: 'error',
            data: error.message
        });
        cleanup();
    }
}

//code partially adapted from v0.dev