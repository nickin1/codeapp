'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Form from '../components/ui/Form';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');
        const password = formData.get('password');
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const phoneNumber = formData.get('phoneNumber');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    firstName,
                    lastName,
                    phoneNumber,
                }),
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to sign up');
            }

            setUser(data.user);
            localStorage.setItem('accessToken', data.accessToken);
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign up');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Create an account</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Join Scriptorium today
                    </p>
                </div>

                <Form onSubmit={handleSubmit} className="mt-8">
                    {error && (
                        <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 text-red-600 dark:text-red-200">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            name="firstName"
                            required
                            autoComplete="given-name"
                        />
                        <Input
                            label="Last Name"
                            name="lastName"
                            required
                            autoComplete="family-name"
                        />
                    </div>

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                    />

                    <Input
                        label="Phone Number"
                        name="phoneNumber"
                        type="tel"
                        required
                        autoComplete="tel"
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        required
                        autoComplete="new-password"
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Sign up
                    </Button>

                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                        >
                            Sign in
                        </Link>
                    </p>
                </Form>
            </div>
        </main>
    );
} 