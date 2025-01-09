const path = require('path');

function getPrismaEnvPath() {
    if (process.env.NODE_ENV === 'production') {
        return path.resolve(process.cwd(), '.env.production');
    }
    return path.resolve(process.cwd(), '.env');
}

module.exports = {
    envPath: getPrismaEnvPath(),
}; 