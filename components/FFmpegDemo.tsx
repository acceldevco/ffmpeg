"use client"

import { useState, useRef, useEffect } from "react"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile } from "@ffmpeg/util"

export default function FFmpegDemo() {
  const [loaded, setLoaded] = useState(false)
  const [converting, setConverting] = useState(false)
  const [outputVideo, setOutputVideo] = useState<string | null>(null)
  const ffmpegRef = useRef(new FFmpeg())

  useEffect(() => {
    const load = async () => {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd"
      const ffmpeg = ffmpegRef.current
      ffmpeg.on("log", ({ message }) => console.log(message))
      await ffmpeg.load({
        coreURL: await fetchFile(`${baseURL}/ffmpeg-core.js`),
        wasmURL: await fetchFile(`${baseURL}/ffmpeg-core.wasm`),
      })
      setLoaded(true)
    }
    load()
  }, [])

  const convertToGrayscale = async (file: File) => {
    const ffmpeg = ffmpegRef.current
    setConverting(true)
    try {
      await ffmpeg.writeFile("input.mp4", await fetchFile(file))
      await ffmpeg.exec(["-i", "input.mp4", "-vf", "colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3", "output.mp4"])
      const data = await ffmpeg.readFile("output.mp4")
      const url = URL.createObjectURL(new Blob([data], { type: "video/mp4" }))
      setOutputVideo(url)
    } catch (error) {
      console.error("Error during conversion:", error)
    }
    setConverting(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Convert video to grayscale</h3>
      {loaded ? (
        <div className="space-y-4">
          <input
            type="file"
            accept="video/mp4"
            onChange={(e) => e.target.files && convertToGrayscale(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {converting && <p>Converting...</p>}
          {outputVideo && (
            <div>
              <h4 className="text-lg font-semibold mb-2">Output Video:</h4>
              <video src={outputVideo} controls className="w-full" />
            </div>
          )}
        </div>
      ) : (
        <p>Loading FFmpeg...</p>
      )}
    </div>
  )
}

