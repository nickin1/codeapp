'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Form from '../components/ui/Form';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { redirect } from 'next/navigation';

const colorOptions = {
    yellow: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABmJLR0QA/wD/AP+gvaeTAAACGUlEQVR4nO3TsQ2AMADAsNL+/xC3IdEHqqww2BdkyfXc6x3A0fw6AP7MIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDAJhAyfSBEga26+EAAAAAElFTkSuQmCC",
    green: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABmJLR0QA/wD/AP+gvaeTAAACGUlEQVR4nO3TsQ2AMADAsNLexv8PIdEHqqww2BdkyXU/6x3A0fw6AP7MIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDAJhAxbbA9NK+lnRAAAAAElFTkSuQmCC",
    blue: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABmJLR0QA/wD/AP+gvaeTAAACGUlEQVR4nO3TsQ2AMADAsNL+/xg3IdEHqqww2BdkybXu5x3A0fw6AP7MIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDAJhA0SJBFgcFpE5AAAAAElFTkSuQmCC",
};

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedColor, setSelectedColor] = useState<string>('blue');

    if (!user) {
        redirect('/login');
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const phone = formData.get('phoneNumber') as string;
        const email = formData.get('email') as string;

        try {
            const res = await fetch(`/api/profile?userId=${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    phone,
                    color: selectedColor,
                    email
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            setUser(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Edit Profile</h1>
                </div>

                <Form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                        <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 text-red-600 dark:text-red-200">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            name="firstName"
                            defaultValue={user.firstName || ''}
                        />
                        <Input
                            label="Last Name"
                            name="lastName"
                            defaultValue={user.lastName || ''}
                        />
                    </div>

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        defaultValue={user.email || ''}
                    />

                    <Input
                        label="Phone Number"
                        name="phoneNumber"
                        type="tel"
                        defaultValue={user.phoneNumber || ''}
                    />
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Avatar Color
                        </label>
                        <div className="flex space-x-4">
                            {Object.entries(colorOptions).map(([color, imageData]) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-10 h-10 rounded-full border-2 overflow-hidden ${selectedColor === color ? 'border-gray-500' : 'border-transparent'
                                        }`}
                                >
                                    <img
                                        src={imageData}
                                        alt={`${color} avatar`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Save Changes
                    </Button>
                </Form>
            </div>
        </main>
    );
}