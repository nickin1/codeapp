import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Github,
  Code2,
  Share2,
  BookOpen,
  Moon,
  Code,
  Library,
  Lock,
  Database,
  Server,
  Shield,
  Wrench,
  Container,
  Layout
} from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="inline-block w-[105px] overflow-hidden whitespace-nowrap animate-typing">
                Hi 👋
              </span>
            </h1>
          </div>

          {/* Project Overview */}
          <Card className="p-6 space-y-4">
            <p className="text-muted-foreground">
              This is a little platform for writing, executing, and sharing code templates. Built to explore
              modern web development practices and full-stack application architecture.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  Code Editor
                </h3>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Monaco editor integration providing a full IDE experience</li>
                  <li>Supports multiple programming languages with syntax highlighting and autocompletion</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Container className="h-5 w-5" />
                  Docker Integration
                </h3>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Containerized code execution environment using Docker</li>
                  <li>Each execution runs in an isolated container with defined resource limits and security constraints</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Self Hosted
                </h3>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>Fully self-hosted infrastructure running PostgreSQL database</li>
                  <li>Docker containers and Next.js application server</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Authentication
                </h3>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>GitHub OAuth integration using NextAuth.js</li>
                  <li>Includes role-based access control and admin approval workflow for new accounts</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Links */}
          <Card className="p-6 text-center">
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline" className="gap-2">
                <Link href="/editor">
                  <Code className="h-4 w-4" />
                  Try It
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/templates">
                  <Library className="h-4 w-4" />
                  See Examples
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
