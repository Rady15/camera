import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    
    let base64String = ''
    let folderName = 'ecommerce/uploads'

    if (contentType.includes('application/json')) {
      const body = await req.json()
      base64String = body.image
      if (body.folder) folderName = body.folder
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
      }
      
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      base64String = `data:${file.type};base64,${base64}`
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
    }

    if (!base64String) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const uploadResponse = await cloudinary.uploader.upload(base64String, {
      folder: folderName,
    })

    return NextResponse.json({
      url: uploadResponse.secure_url,
      image: {
        url: uploadResponse.secure_url,
      }
    })

  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error uploading file' },
      { status: 500 }
    )
  }
}
