interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    children: React.ReactNode;
}

export default function Form({ children, className = '', ...props }: FormProps) {
    return (
        <form
            className={`space-y-6 ${className}`}
            {...props}
        >
            {children}
        </form>
    );
} 