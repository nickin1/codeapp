module.exports = {
    apps: [{
        name: 'codeapp',
        script: 'npm',
        args: 'start',
        env: {
            NODE_ENV: 'production',
        },
        watch: false,
        error_file: 'logs/error.log',
        out_file: 'logs/output.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true,
        instances: '6',
        exec_mode: 'cluster',
        max_memory_restart: '300M'  // Restart if memory exceeds this
    }]
} 