'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from '../context/ThemeContext';

const colorOptions = {
    yellow: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABmJLR0QA/wD/AP+gvaeTAAACGUlEQVR4nO3TsQ2AMADAsNL+/xC3IdEHqqww2BdkyfXc6x3A0fw6AP7MIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDAJhAyfSBEga26+EAAAAAElFTkSuQmCC",
    green: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABmJLR0QA/wD/AP+gvaeTAAACGUlEQVR4nO3TsQ2AMADAsNLexv8PIdEHqqww2BdkyXU/6x3A0fw6AP7MIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDAJhAxbbA9NK+lnRAAAAAElFTkSuQmCC",
    blue: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABmJLR0QA/wD/AP+gvaeTAAACGUlEQVR4nO3TsQ2AMADAsNL+/xg3IdEHqqww2BdkybXu5x3A0fw6AP7MIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDALBIBAMAsEgEAwCwSAQDAJhA0SJBFgcFpE5AAAAAElFTkSuQmCC",
};

export default function ProfilePage() {
    const { user, setUser, isLoading: isAuthLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedColor, setSelectedColor] = useState<string>(user?.avatar || 'blue');
    const router = useRouter();
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login');
        } else if (user && !user.phoneNumber) {
            fetchUserProfile();
        } else if (user) {
            setIsLoadingProfile(false);
        }
    }, [user, router, isAuthLoading]);

    useEffect(() => {
        if (user?.avatar) {
            setSelectedColor(user.avatar);
        }
        console.log(user?.avatar);
    }, [user?.avatar]);

    async function fetchUserProfile() {
        try {
            const res = await fetch(`/api/profile?userId=${user?.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch profile');
            }

            setUser(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch profile');
        } finally {
            setIsLoadingProfile(false);
        }
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

    if (isAuthLoading || !user) {
        return (
            <main className="flex min-h-screen items-center justify-center px-4 bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">
                            <Skeleton className="h-8 w-32 mx-auto bg-muted" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20 bg-muted" />
                                <Skeleton className="h-10 w-full bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20 bg-muted" />
                                <Skeleton className="h-10 w-full bg-muted" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20 bg-muted" />
                            <Skeleton className="h-10 w-full bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20 bg-muted" />
                            <Skeleton className="h-10 w-full bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24 bg-muted" />
                            <div className="flex space-x-4">
                                <Skeleton className="h-10 w-10 rounded-full bg-muted" />
                                <Skeleton className="h-10 w-10 rounded-full bg-muted" />
                                <Skeleton className="h-10 w-10 rounded-full bg-muted" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-full bg-muted" />
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4 bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-foreground">Edit Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    defaultValue={user.firstName || ''}
                                    className="bg-background text-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    defaultValue={user.lastName || ''}
                                    className="bg-background text-foreground"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={user.email || ''}
                                className="bg-background text-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber" className="text-foreground">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                defaultValue={user.phoneNumber || ''}
                                className="bg-background text-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-foreground">Avatar Color</Label>
                            <div className="flex space-x-4">
                                {Object.entries(colorOptions).map(([color, imageData]) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-10 h-10 rounded-full border-2 overflow-hidden cursor-pointer transition-colors ${selectedColor === color
                                            ? 'border-primary'
                                            : 'border-transparent hover:border-muted-foreground'
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
                            disabled={isLoading}
                        >
                            {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}