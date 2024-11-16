interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({
    label,
    error,
    className = '',
    ...props
}: InputProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <input
                className={`
                    mt-1 block w-full rounded-md 
                    border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-800
                    shadow-sm focus:border-blue-500 focus:ring-blue-500 
                    ${error ? 'border-red-500' : ''}
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}