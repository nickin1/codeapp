module.exports = {
    apps: [{
        name: 'codeapp',
        script: 'npm',
        args: 'start',
        env: {
            NODE_ENV: 'production',
        },
        watch: false,
        max_memory_restart: '1G',
        error_file: 'logs/error.log',
        out_file: 'logs/output.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true,
        instances: 'max',
        exec_mode: 'cluster'
    }]
} 