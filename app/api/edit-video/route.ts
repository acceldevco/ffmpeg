import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { writeFile, unlink } from "fs/promises"
import path from "path"
import os from "os"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const video = formData.get("video") as File
  const startTime = formData.get("startTime")
  const endTime = formData.get("endTime")
  const watermarkText = formData.get("watermarkText")
  const outputFormat = formData.get("outputFormat")

  if (!video) {
    return NextResponse.json({ error: "No video file provided" }, { status: 400 })
  }

  const tempDir = os.tmpdir()
  const inputPath = path.join(tempDir, `input_${Date.now()}.mp4`)
  const outputPath = path.join(tempDir, `output_${Date.now()}.${outputFormat}`)

  try {
    // Write the uploaded file to disk
    const bytes = await video.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(inputPath, buffer)

    // Construct FFmpeg command
    let command = `ffmpeg -i ${inputPath} -ss ${startTime} -to ${endTime}`

    if (watermarkText) {
      command += ` -vf "drawtext=text='${watermarkText}':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=(h-text_h)/2"`
    }

    command += ` -c:a copy ${outputPath}`

    // Execute FFmpeg command
    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`FFmpeg error: ${error}`)
          console.error(`FFmpeg stderr: ${stderr}`)
          reject(new Error(`FFmpeg error: ${error.message}`))
        } else {
          resolve(stdout)
        }
      })
    })

    // Read the output file
    const outputBuffer = await require("fs").promises.readFile(outputPath)

    // Clean up temporary files
    await unlink(inputPath)
    await unlink(outputPath)

    // Send the processed video as a response
    return new NextResponse(outputBuffer, {
      headers: {
        "Content-Type": `video/${outputFormat}`,
        "Content-Disposition": `attachment; filename="processed_video.${outputFormat}"`,
      },
    })
  } catch (error) {
    console.error("Error processing video:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error processing video" },
      { status: 500 },
    )
  }
}

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }

