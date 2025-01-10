module.exports = {
    apps: [{
        name: 'scriptorium-prod',
        script: './node_modules/.bin/next',
        args: 'start',
        cwd: '/home/nickin/Desktop/scriptorium',
        env: {
            NODE_ENV: 'production',
            PATH: process.env.PATH,
            PORT: 3000,
            DOCKER_SOCKET: '/var/run/docker.sock'
        },
        instances: 6,
        exec_mode: 'cluster',
        max_memory_restart: '500M',
        error_file: 'logs/error.log',
        out_file: 'logs/output.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true,
        user: "nickin",
        group: "scriptorium-group",
    }]
} 