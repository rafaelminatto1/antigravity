import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex h-[calc(100vh-100px)] flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-9 w-32 mb-2" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            <div className="flex h-full gap-6 overflow-x-auto pb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex h-full w-80 min-w-[320px] flex-col rounded-xl bg-muted/30 border backdrop-blur-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, j) => (
                                <Skeleton key={j} className="h-32 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
