import Image from "next/image"

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
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="relative size-32">
                            <Image
                                src="/images/gis_logo.png"
                                alt="Ghana International School Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <div className="flex flex-col items-center gap-2 text-center mb-6">
                            <h1 className="text-2xl font-bold">{title}</h1>
                            <p className="text-muted-foreground text-sm text-balance">
                                {description}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <Image
                    src="/images/auth-image.jpg"
                    alt="Image"
                    fill
                    className="object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}
