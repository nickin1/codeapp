import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/auth.config";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        redirect('/not-found');
    }

    return <>{children}</>;
} 