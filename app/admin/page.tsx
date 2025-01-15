'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Terminal } from "lucide-react";
import UserManagement from '../components/admin/UserManagement';
import ExecutionLogs from '../components/admin/ExecutionLogs';

export default function AdminPanel() {
    return (
        <div className="min-h-screen bg-card">
            <div className="container mx-auto py-8 space-y-6">
                <Tabs defaultValue="users">
                    <TabsList>
                        <TabsTrigger value="users" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Users
                        </TabsTrigger>
                        <TabsTrigger value="executions" className="flex items-center gap-2">
                            <Terminal className="h-4 w-4" />
                            Code Executions
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="users">
                        <UserManagement />
                    </TabsContent>
                    <TabsContent value="executions">
                        <ExecutionLogs />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
} 