"use client"

import { ReactNode } from "react"
import {Toaster} from "sonner";

export default function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      {children}
      <Toaster richColors={true} position="top-right" />
    </>
  )
}