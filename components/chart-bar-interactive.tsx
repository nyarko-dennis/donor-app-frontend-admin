
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A bar chart"

const chartConfig = {
    amount: {
        label: "Amount",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

interface ChartBarInteractiveProps {
    data: Array<{ label: string; value: number }>
}

export function ChartBarInteractive({ data }: ChartBarInteractiveProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Donations by Campaign</CardTitle>
                <CardDescription>Top performing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 10)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="value" fill="var(--color-amount)" radius={8} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
