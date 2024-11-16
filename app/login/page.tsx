'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Form from '../components/ui/Form';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await login(email, password);
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Welcome back</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Sign in to your account
                    </p>
                </div>

                <Form onSubmit={handleSubmit} className="mt-8">
                    {error && (
                        <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 text-red-600 dark:text-red-200">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Sign in
                    </Button>

                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link
                            href="/signup"
                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                        >
                            Sign up
                        </Link>
                    </p>
                </Form>
            </div>
        </main>
    );
}