'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff } from 'lucide-react'

interface Props {
  onScan: (code: string) => void
}

export default function QRScanner({ onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setActive(true)
      setError(null)
      scanLoop()
    } catch {
      setError('カメラへのアクセスが許可されていません')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setActive(false)
  }

  async function scanLoop() {
    if (!('BarcodeDetector' in window)) {
      setError('このブラウザはQRコードスキャンに対応していません。コード手入力をご利用ください。')
      stopCamera()
      return
    }
    // @ts-expect-error BarcodeDetector is experimental
    const detector = new BarcodeDetector({ formats: ['qr_code'] })
    const tick = async () => {
      if (!videoRef.current || !streamRef.current) return
      try {
        const barcodes = await detector.detect(videoRef.current)
        if (barcodes.length > 0) {
          onScan(barcodes[0].rawValue)
          stopCamera()
          return
        }
      } catch {}
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  useEffect(() => () => stopCamera(), [])

  return (
    <div className="flex flex-col items-center gap-4">
      {active ? (
        <>
          <div className="relative overflow-hidden rounded-xl border-2 border-primary">
            <video ref={videoRef} className="h-64 w-64 object-cover" playsInline />
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
