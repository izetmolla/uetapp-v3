import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
    AtomIcon,
    BadgeDollarSignIcon,
    CatIcon,
    ChevronRight,
    Clock12Icon, ContainerIcon,
    FileText, MoreHorizontal, Package2Icon,
    PaletteIcon, PlusIcon, ShipWheelIcon, UserCheck, UserPlus, UsersIcon
} from "lucide-react";
import { TreePalmIcon } from "lucide-react";
import { UnlinkIcon } from "lucide-react";
import {
    Timeline,
    TimelineItem,
    TimelineHeader,
    TimelineSeparator,
    TimelineTitle,
    TimelineContent,
    TimelineIndicator,
    TimelineDate
} from "@workspace/ui/components/timeline";
import { Link } from "react-router";
import { Avatar, AvatarImage, AvatarFallback } from "@workspace/ui/components/avatar";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@workspace/ui/components/table";
import { Progress } from "@workspace/ui/components/progress";



const activities = [
    {
        id: "1",
        type: "file-upload",
        title: "Task report - uploaded weekly reports",
        description: "Added 3 files to task",
        timestamp: "5 minutes ago",
        files: [
            { name: "weekly-reports.xls", size: "12kb", type: "excel" },
            { name: "weekly-reports.xls", size: "4kb", type: "word" },
            { name: "monthly-reports.xls", size: "8kb", type: "word" }
        ]
    },
    {
        id: "2",
        type: "status-update",
        title: "Project status updated",
        description: "Marked",
        timestamp: "3 hours ago",
        badge: { text: "Completed", color: "cyan" }
    },
    {
        id: "3",
        type: "image-added",
        title: "3 new photos added",
        description: "Added 3 images to",
        timestamp: "Yesterday",
        images: [
            {
                id: "1",
                src: "https://plus.unsplash.com/premium_photo-1751667124857-32b5a1c63d8a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=400"
            },
            {
                id: "2",
                src: "https://images.unsplash.com/photo-1747302793923-23f66490ae0d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=400"
            },
            {
                id: "3",
                src: "https://images.unsplash.com/photo-1756038714389-8ff4e5967ed5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=400"
            }
        ]
    }
];

const connections = [
    {
        id: "1",
        name: "Rachel Doe",
        initials: "R",
        connections: 25,
        status: "connected",
        online: true
    },
    {
        id: "2",
        name: "Isabella Finley",
        avatar:
            "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200",
        connections: 79,
        status: "pending",
        online: true
    },
    {
        id: "3",
        name: "David Harrison",
        avatar:
            "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=200",
        connections: 0,
        status: "connected"
    },
    {
        id: "4",
        name: "Costa Quinn",
        avatar:
            "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200",
        connections: 9,
        status: "pending",
        online: false
    }
];

const teams = [
    { id: "1", icon: UsersIcon, name: "#digitalmarketing", members: 8 },
    { id: "2", icon: BadgeDollarSignIcon, name: "#ethereum", members: 14 },
    { id: "3", icon: ContainerIcon, name: "#conference", members: 3 },
    { id: "4", icon: PaletteIcon, name: "#supportteam", members: 3 }
];


const projects = [
    {
        id: "1",
        name: "UI/UX",
        icon: Package2Icon,
        progress: 0,
        hoursSpent: "4:25",
        updated: "Updated 2 hours ago"
    },
    {
        id: "2",
        name: "Get a complete audit store",
        icon: ShipWheelIcon,
        progress: 45,
        hoursSpent: "18:42",
        updated: "Updated 1 day ago"
    },
    {
        id: "3",
        name: "Build stronger customer relationships",
        icon: TreePalmIcon,
        progress: 59,
        hoursSpent: "9:01",
        updated: "Updated 2 days ago"
    },
    {
        id: "4",
        name: "Update subscription method",
        icon: UnlinkIcon,
        progress: 57,
        hoursSpent: "0:37",
        updated: "Updated 2 days ago"
    },
    {
        id: "5",
        name: "Create a new theme",
        icon: AtomIcon,
        progress: 100,
        hoursSpent: "24:12",
        updated: "Updated 1 week ago"
    },
    {
        id: "6",
        name: "Improve social banners",
        icon: CatIcon,
        progress: 0,
        hoursSpent: "8:08",
        updated: "Updated 1 week ago"
    }
];

const Profile = () => {
    return (
        <>
            <Card className="overflow-hidden pb-0">
                <CardHeader>
                    <CardTitle>Activity stream</CardTitle>
                    <CardAction>
                        <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal />
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <Timeline defaultValue={3}>
                        {activities.map((activity) => (
                            <TimelineItem key={activity.id} step={Number(activity.id)} className="space-y-2">
                                <TimelineHeader>
                                    <TimelineSeparator />
                                    <TimelineTitle className="-mt-0.5">{activity.title}</TimelineTitle>
                                    <TimelineIndicator />
                                </TimelineHeader>
                                <TimelineContent className="space-y-4">
                                    {activity.files && (
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            {activity.files.map((file, idx) => (
                                                <Link
                                                    to="#"
                                                    key={idx}
                                                    className="bg-muted/30 hover:bg-muted flex items-center gap-3 rounded-lg border p-4">
                                                    <FileText className="text-muted-foreground size-5" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium">{file.name}</p>
                                                        <p className="text-muted-foreground text-xs">{file.size}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {activity.images && (
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            {activity.images.map((img) => (
                                                <figure key={img.id}>
                                                    <img className="aspect-video w-full rounded-lg" src={img.src} alt="..." />
                                                </figure>
                                            ))}
                                        </div>
                                    )}

                                    {activity.timestamp && (
                                        <TimelineDate className="mt-2 mb-0 flex items-center gap-1.5">
                                            <Clock12Icon className="size-3" />
                                            {activity.timestamp}
                                        </TimelineDate>
                                    )}
                                </TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>
                </CardContent>
                <CardFooter className="border-t p-0!">
                    <Button variant="ghost" className="w-full rounded-none">
                        View more
                    </Button>
                </CardFooter>
            </Card>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="overflow-hidden pb-0">
                    <CardHeader>
                        <CardTitle>Connections</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {connections.map((connection) => (
                            <div key={connection.id} className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="size-10">
                                        {connection.avatar ? (
                                            <AvatarImage src={connection.avatar} alt={connection.name} />
                                        ) : (
                                            <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                                {connection.initials}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    {connection.online && (
                                        <div className="border-background absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 bg-green-500" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="font-medium">{connection.name}</p>
                                    <p className="text-muted-foreground text-sm">
                                        {connection.connections} connections
                                    </p>
                                </div>

                                {connection.status === "connected" ? (
                                    <Button
                                        size="icon-sm"
                                        className="shrink-0 rounded-full bg-blue-500 hover:bg-blue-600">
                                        <UserCheck />
                                    </Button>
                                ) : (
                                    <Button size="icon-sm" variant="outline" className="shrink-0 rounded-full">
                                        <UserPlus />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </CardContent>

                    <CardFooter className="border-t p-0!">
                        <Button variant="link" className="flex w-full justify-between rounded-none lg:px-6!">
                            View all connections
                            <ChevronRight />
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="overflow-hidden pb-0">
                    <CardHeader>
                        <CardTitle>Teams</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {teams.map((team) => (
                            <div key={team.id} className="flex items-center gap-4">
                                <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                                    {team.icon && <team.icon className="size-5" />}
                                </div>

                                <div className="flex-1">
                                    <p className="font-medium">{team.name}</p>
                                    <p className="text-muted-foreground text-sm">{team.members} members</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="border-t p-0!">
                        <Button variant="link" className="flex w-full justify-between rounded-none lg:px-6!">
                            View all teams
                            <ChevronRight />
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Card className="pb-0">
                <CardHeader>
                    <CardTitle>Projects</CardTitle>
                    <CardAction className="-mt-2">
                        <Button variant="outline" size="sm">
                            <PlusIcon /> New Project
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Project</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead className="text-right">Hours Spent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg text-lg">
                                                {project.icon && <project.icon className="size-5" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">{project.name}</p>
                                                <p className="text-muted-foreground text-xs">{project.updated}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={project.progress} />
                                            <span className="text-muted-foreground w-8 shrink-0 text-right text-sm">
                                                {project.progress}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{project.hoursSpent}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="border-t p-0!">
                    <Button variant="link" className="text-muted-foreground w-full justify-center">
                        View all projects
                        <ChevronRight />
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}

export default Profile