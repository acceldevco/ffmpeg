import Link from "next/link"
import { Button } from "@/components/ui/button"
import VideoEditor from "@/components/VideoEditor"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <header className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4">
        </div>
      </header> */}
      <main className="flex-grow">
        <section id="editor" className="bg-gray-100 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">ویرایش ویدیو</h2>
            <VideoEditor />
          </div>
        </section>
      </main>

      {/* <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} FFmpeg Video Editor. All rights reserved.</p>
        </div>
      </footer> */}
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p>{description}</p>
    </div>
  )
}

