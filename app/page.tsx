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
  Layout,
  Terminal,
  Users,
  Cloud,
  Globe,
  ArrowLeft,
  Linkedin,
  CornerUpLeft,
  Undo2,
  Mail,
  Link2,
  ExternalLink
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const TechBadge = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="inline-flex items-center rounded-md font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors px-1 py-0.5 h-[1.6em]"
  >
    <span className="inline-flex items-center">{children}</span>
    <ExternalLink className="w-3 h-3 ml-1" />
  </Link>
);

export default function Home() {
  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section with Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6 pb-10">
          {/* Left side: Title and buttons */}
          <div className="flex flex-col justify-between h-[200px]">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Hi 👋
              </h1>
              <p className="text-xl text-muted-foreground">
                This is a platform for running code, saving and sharing templates, and having forum-like discussions.
                I built it to learn and explore the process of creating a real-world app from the ground up, in terms of both software and hardware.
              </p>
            </div>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/editor" className="gap-2">
                  <Terminal className="h-4 w-4" />
                  Try the Editor
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://github.com/nickin1/scriptorium" className="gap-2">
                  <Github className="h-4 w-4" />
                  View Source
                </Link>
              </Button>
            </div>
          </div>

          {/* Right side: Personal Info Card */}
          <Card className="p-6 border-0 shadow-none h-[200px] flex flex-col justify-center bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/avatar.jpg" alt="Nikita Goncharov" />
                  <AvatarFallback>NG</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">Nikita Goncharov</h2>
                  <p className="text-sm text-muted-foreground">Software Engineer</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  ...
                </p>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="https://nikitagoncharov.com" className="gap-2">
                          <Undo2 className="h-4 w-4" />
                          Back
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Return to nikitagoncharov.com</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="https://github.com/nickin1">
                      <Github className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="https://www.linkedin.com/in/nikita-g-0b2393205/">
                      <Linkedin className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                    <Link href="mailto:info@nikitagoncharov.com">
                      <Mail className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tech Stack Overview */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {/* Code Execution Card */}
            <Card className="p-6 pb-3 border-0 shadow-none">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Terminal className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Code Execution</h2>
                  <p className="text-sm text-muted-foreground">in a secure and isolated environment</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground pl-4">
                <li className="flex items-start gap-2 min-h-[48px]">
                  <Code2 className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  <span>Monaco Editor with IDE features, supporting 10 programming languages</span>
                </li>
                <li className="flex items-start gap-2 min-h-[48px]">
                  <Container className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  <span>Process isolation with <TechBadge href="https://www.docker.com/">Docker</TechBadge>
                    , with resource limits and security controls
                  </span>
                </li>
                <li className="flex items-start gap-2 min-h-[48px]">
                  <Database className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  <span>Real-time output viewing with Server-Sent Events</span>
                </li>
              </ul>
            </Card>

            {/* Community Features Card */}
            <Card className="p-6 pb-3 border-0 shadow-none">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Community Features</h2>
                  <p className="text-sm text-muted-foreground">share code and discuss</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground pl-4">
                <li className="flex items-start gap-2 min-h-[48px]">
                  <Library className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  <span>Save and share code templates, linkable in blog posts</span>
                </li>
                <li className="flex items-start gap-2 min-h-[48px]">
                  <BookOpen className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  <span>Blog system with full markdown support, including preview</span>
                </li>
                <li className="flex items-start gap-2 min-h-[48px]">
                  <Shield className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  <span>Content moderation through user reports and admin dashboard</span>
                </li>
              </ul>
            </Card>

            {/* Infrastructure Card */}
            <Card className="p-6 pt-3 border-0 shadow-none">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Infrastructure</h2>
                  <p className="text-sm text-muted-foreground">self-hosted on my own hardware</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground pl-4">
                <li className="flex items-start gap-2 min-h-[48px]">
                  <Cloud className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  <span>Hosted on my Ubuntu homeserver, with automatic monitoring and semi-automatic deployment</span>
                </li>
                <li className="flex items-start gap-2 min-h-[48px]">
                  <Database className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  <span>Dockerized PostgreSQL database and Prisma ORM for type-safe queries</span>
                </li>
                <li className="flex items-start gap-2 min-h-[48px]">
                  <Layout className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  <span>
                    <TechBadge href="https://nextjs.org/">Next.js</TechBadge> with server components and server actions
                  </span>
                </li>
              </ul>
            </Card>

            {/* Security & Auth Card */}
            <Card className="p-6 pt-3 border-0 shadow-none">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Security & Auth</h2>
                  <p className="text-sm text-muted-foreground">Enterprise-grade security</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground pl-4">
                <li className="flex items-start gap-2 min-h-[48px]">
                  <Github className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  <span>Github OAuth using <TechBadge href="https://next-auth.js.org/">NextAuth.js</TechBadge></span>
                </li>
                <li className="flex items-start gap-2 min-h-[48px]">
                  <Shield className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  <span>Role-based access control with admin dashboard for managing users and content</span>
                </li>
                <li className="flex items-start gap-2 min-h-[48px]">
                  <Users className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                  <span>Users need their account to be activated by an admin to log in</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
