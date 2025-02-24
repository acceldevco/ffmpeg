import type React from "react"
import "./globals.css"
import type { Metadata } from "next"




export const metadata: Metadata = {
  title: "FFmpeg Video Editor",
  description: "Professional video editing powered by FFmpeg",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}



import './globals.css'
