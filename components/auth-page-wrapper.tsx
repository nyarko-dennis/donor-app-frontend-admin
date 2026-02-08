import { GalleryVerticalEnd } from "lucide-react"

export default function AuthPageWrapper({
    children,
    title,
    description
}: {
    children: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-muted/20">
            <div className="w-full max-w-sm flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        {description}
                    </p>
                </div>
                {children}
            </div>
        </div>
    )
}
