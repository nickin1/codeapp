import jwt from 'jsonwebtoken'

export function generateAccessToken(userId) {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(userId) {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
}

export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    } catch (error) {
        return null
    }
}