import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
            <div className="text-center space-y-6">
                <div className="space-y-2">
                    <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h1 className="text-4xl font-bold tracking-tight">404</h1>
                    <p className="text-xl text-muted-foreground">
                        Page not found
                    </p>
                </div>
                <p className="text-muted-foreground max-w-[500px]">
                    The page you're looking for doesn't exist or has been moved.
                    You can return to the homepage or try a different page.
                </p>
                <div className="flex justify-center gap-4">
                    <Button asChild>
                        <Link href="/">
                            Return Home
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/editor">
                            Try Editor
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
} 