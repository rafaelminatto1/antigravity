import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-9 w-48 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 flex-1 max-w-sm" />
                    <Skeleton className="h-10 w-10" />
                </div>

                <div className="rounded-md border bg-card/50 backdrop-blur-sm p-4">
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
