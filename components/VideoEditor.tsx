"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VideoEditor() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [watermarkText, setWatermarkText] = useState("")
  const [outputFormat, setOutputFormat] = useState("mp4")
  const [processing, setProcessing] = useState(false)
  const [outputVideo, setOutputVideo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0])
      setOutputVideo(null)
      setError(null)
    }
  }

  const handleTrim = async () => {
    if (!videoFile) {
      setError("لطفا یک ویدیو قرار دهید.")
      return
    }
    setProcessing(true)
    setError(null)
    const formData = new FormData()
    formData.append("video", videoFile)
    formData.append("startTime", startTime.toString())
    formData.append("endTime", endTime.toString())
    formData.append("watermarkText", watermarkText)
    formData.append("outputFormat", outputFormat)

    try {
      const response = await fetch("/api/edit-video", {
        method: "POST",
        body: formData,
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setOutputVideo(url)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "ارور در پردازش")
      }
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "یک خطایی رخ داد")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>خطا</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mb-4">
        <Label htmlFor="video-upload">اپلود ویدیو</Label>
        <Input id="video-upload" type="file" accept="video/*" onChange={handleFileChange} />
      </div>
      {videoFile && (
        <>
          <video
            ref={videoRef}
            src={URL.createObjectURL(videoFile)}
            controls
            className="w-full mb-4"
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setEndTime(videoRef.current.duration)
              }
            }}
          />
          <div className="mb-4">
            <Label>بریدن ویدیو</Label>
            <Slider
              min={0}
              max={videoRef.current?.duration || 100}
              step={0.1}
              value={[startTime, endTime]}
              onValueChange={(values) => {
                setStartTime(values[0])
                setEndTime(values[1])
              }}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{startTime.toFixed(1)}s</span>
              <span>{endTime.toFixed(1)}s</span>
            </div>
          </div>
          <div className="mb-4">
            <Label htmlFor="watermark">متن واترمارک</Label>
            <Input
              id="watermark"
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="Enter watermark text"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="output-format">فرمت خروجی</Label>
            <select
              id="output-format"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="mp4">MP4</option>
              <option value="webm">WebM</option>
              <option value="gif">GIF</option>
            </select>
          </div>
          <Button onClick={handleTrim} disabled={processing}>
            {processing ? "درحال پردازش..." : "پردازش ویدیو"}
          </Button>
        </>
      )}
      {outputVideo && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">خروجی:</h3>
          <video src={outputVideo} controls className="w-full" />
          <Button asChild className="mt-2">
            <a href={outputVideo} download={`processed_video.${outputFormat}`}>
              دانلود
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}

