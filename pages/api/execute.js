import { DockerExecutor } from '../../lib/dockerExecutor';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth.config";
import { PrismaClient } from '@prisma/client';
import geoip from 'geoip-lite';

const dockerExecutor = new DockerExecutor();
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    const { code, language, input } = req.body;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const ip = req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.socket.remoteAddress ||
        'unknown';

    const ipAddress = Array.isArray(ip) ? ip[0] : ip;
    let country = 'Unknown';

    try {
        const geo = geoip.lookup(ipAddress);
        country = geo?.country || 'Unknown';
    } catch (error) {
        console.error('Failed to get IP location:', error);
    }

    const sendEvent = (type, data) => {
        res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
        if (res.flush) {
            res.flush();
        }
    };

    try {
        const { output, stats } = await dockerExecutor.executeCode(
            code,
            language,
            input,
            (type, data) => {
                sendEvent(type, data);
            }
        );

        await prisma.executionLog.create({
            data: {
                code,
                language,
                ipAddress,
                country,
                userId: session?.user?.id || null,
                memoryUsage: stats.memoryUsage,
                cpuUsage: stats.cpuUsage,
                execTime: stats.execTime
            }
        });
    } catch (error) {
        sendEvent('error', error.message);
    } finally {
        res.end();
    }
}
