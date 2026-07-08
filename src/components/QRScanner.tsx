'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff } from 'lucide-react'
import jsQR from 'jsqr'

interface Props {
  onScan: (code: string) => void
}

export default function QRScanner({ onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  function stopCamera() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setActive(false)
  }

  function scanLoop() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !streamRef.current) return

    if (video.readyState >= video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code) {
          onScanRef.current(code.data)
          stopCamera()
          return
        }
      }
    }

    rafRef.current = requestAnimationFrame(scanLoop)
  }

  async function startCamera() {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('このブラウザはカメラアクセスに対応していません。コード手入力をご利用ください。')
      return
    }
    try {
      // ideal: 'environment' = 背面カメラ優先、なければ前面カメラにフォールバック
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      })
      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        video.play().catch(() => {})
      }
      setActive(true)
      rafRef.current = requestAnimationFrame(scanLoop)
    } catch (e) {
      const err = e as DOMException
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('カメラへのアクセスが許可されていません。ブラウザのアドレスバー横の鍵アイコンからカメラを許可してください。')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('カメラが見つかりません。カメラが接続されているか確認してください。')
      } else if (err.name === 'NotReadableError') {
        setError('カメラが他のアプリで使用中です。他のアプリを閉じてからお試しください。')
      } else {
        setError(`カメラを起動できませんでした。(${err.name ?? '不明なエラー'})`)
      }
    }
  }

  useEffect(() => () => stopCamera(), [])

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="hidden" />
      {active ? (
        <>
          <div className="relative overflow-hidden rounded-xl border-2 border-primary">
            <video
              ref={videoRef}
              className="h-64 w-64 object-cover"
              playsInline
              muted
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-lg border-2 border-white opacity-60" />
            </div>
          </div>
          <button
            onClick={stopCamera}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <CameraOff size={16} />
            スキャン停止
          </button>
        </>
      ) : (
        <button
          onClick={startCamera}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-medium hover:bg-primary/90 transition"
        >
          <Camera size={18} />
          QRコードをスキャン
        </button>
      )}
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  )
}
