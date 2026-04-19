"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  ZoomIn, ZoomOut, RotateCcw, Upload, Move,
  Maximize2, Download, RefreshCw, Search,
} from "lucide-react"

interface XrayViewerProps {
  onImageUpload?: (file: File, dataUrl: string) => void
}

const MAGNIFIER_SIZE = 160
const MAGNIFIER_ZOOM = 2.8

export function XrayViewerWithMagnifier({ onImageUpload }: XrayViewerProps) {
  const [image, setImage] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [magnifierEnabled, setMagnifierEnabled] = useState(false)
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 })
  const [showMagnifier, setShowMagnifier] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        setImage(dataUrl)
        setZoom(100); setPosition({ x: 0, y: 0 }); setRotation(0)
        onImageUpload?.(file, dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleZoomIn  = () => setZoom((p) => Math.min(p + 25, 300))
  const handleZoomOut = () => setZoom((p) => Math.max(p - 25, 25))
  const handleReset   = () => { setZoom(100); setPosition({ x: 0, y: 0 }); setRotation(0) }
  const handleRotate  = () => setRotation((p) => (p + 90) % 360)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!image || magnifierEnabled) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }, [image, position, magnifierEnabled])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (magnifierEnabled && image) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      setMagnifierPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setShowMagnifier(true)
    }
    if (!isDragging) return
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }, [isDragging, dragStart, magnifierEnabled, image])

  const handleMouseUp    = useCallback(() => setIsDragging(false), [])
  const handleMouseLeave = useCallback(() => { setIsDragging(false); setShowMagnifier(false) }, [])
  const handleWheel      = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((p) => Math.min(Math.max(p + (e.deltaY > 0 ? -10 : 10), 25), 300))
  }, [])

  // ✅ Only individual background-* properties — no `background` shorthand
  const getLensStyle = (): React.CSSProperties => {
    if (!containerRef.current || !imgRef.current || !image) return {}
    const cRect  = containerRef.current.getBoundingClientRect()
    const imgEl  = imgRef.current
    const iRect  = imgEl.getBoundingClientRect()
    const relX   = magnifierPos.x - (iRect.left - cRect.left)
    const relY   = magnifierPos.y - (iRect.top  - cRect.top)
    const bgW    = imgEl.naturalWidth  * (zoom / 100) * MAGNIFIER_ZOOM
    const bgH    = imgEl.naturalHeight * (zoom / 100) * MAGNIFIER_ZOOM
    const bgX    = -(relX * MAGNIFIER_ZOOM) + MAGNIFIER_SIZE / 2
    const bgY    = -(relY * MAGNIFIER_ZOOM) + MAGNIFIER_SIZE / 2

    return {
      position:             "absolute",
      left:                 magnifierPos.x - MAGNIFIER_SIZE / 2,
      top:                  magnifierPos.y - MAGNIFIER_SIZE / 2,
      width:                MAGNIFIER_SIZE,
      height:               MAGNIFIER_SIZE,
      borderRadius:         "50%",
      border:               "2.5px solid hsl(var(--primary))",
      boxShadow:            "0 0 0 1px hsl(var(--border)), 0 8px 32px rgba(0,0,0,0.5)",
      // Individual background-* props — no shorthand
      backgroundImage:      `url(${image})`,
      backgroundRepeat:     "no-repeat",
      backgroundSize:       `${bgW}px ${bgH}px`,
      backgroundPosition:   `${bgX}px ${bgY}px`,
      backgroundAttachment: "scroll",
      backgroundOrigin:     "padding-box",
      backgroundClip:       "border-box",
      pointerEvents:        "none",
      zIndex:               20,
    }
  }

  return (
    <Card className="flex flex-col h-full border-border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="w-4 h-4 mr-2" />Upload X-Ray
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>

        {image && (
          <div className="flex items-center gap-1 flex-wrap">
            <Button variant="ghost" size="icon" onClick={handleZoomOut}><ZoomOut className="w-4 h-4" /></Button>
            <div className="w-24 px-2">
              <Slider value={[zoom]} onValueChange={(v) => setZoom(v[0])} min={25} max={300} step={5} />
            </div>
            <Button variant="ghost" size="icon" onClick={handleZoomIn}><ZoomIn className="w-4 h-4" /></Button>
            <span className="text-xs text-muted-foreground w-12 text-center">{zoom}%</span>
            <div className="w-px h-6 bg-border mx-1" />
            <Button variant="ghost" size="icon" onClick={handleRotate}><RefreshCw className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant={magnifierEnabled ? "default" : "ghost"}
              size="icon"
              onClick={() => setMagnifierEnabled((v) => !v)}
              title={magnifierEnabled ? "Desactivar lupa" : "Activar lupa"}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Viewer */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-muted/30"
        style={{ cursor: magnifierEnabled && image ? "none" : isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        {image ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                ref={imgRef}
                src={image}
                alt="X-Ray"
                className="max-w-none select-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                }}
                draggable={false}
              />
            </div>

            {magnifierEnabled && showMagnifier && (
              <>
                {/* Magnified image */}
                <div style={getLensStyle()} />
                {/* Crosshair (separate div, no background conflict) */}
                <div style={{
                  position: "absolute",
                  left: magnifierPos.x - MAGNIFIER_SIZE / 2,
                  top:  magnifierPos.y - MAGNIFIER_SIZE / 2,
                  width: MAGNIFIER_SIZE, height: MAGNIFIER_SIZE,
                  borderRadius: "50%", overflow: "hidden",
                  pointerEvents: "none", zIndex: 21,
                }}>
                  <div style={{ position:"absolute", left:"50%", top:"10%", bottom:"10%", width:1, backgroundColor:"rgba(255,255,255,0.35)", transform:"translateX(-50%)" }} />
                  <div style={{ position:"absolute", top:"50%", left:"10%", right:"10%", height:1, backgroundColor:"rgba(255,255,255,0.35)", transform:"translateY(-50%)" }} />
                </div>
              </>
            )}

            {magnifierEnabled && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none flex items-center gap-1.5">
                <Search className="w-3 h-3" /> Lupa activa — mueve el cursor sobre la imagen
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Upload an X-Ray Image</h3>
            <p className="text-sm text-center max-w-xs mb-4">
              Drag and drop an image or click the upload button to begin analysis
            </p>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1"><Move className="w-3 h-3" /><span>Click &amp; drag to pan</span></div>
              <div className="flex items-center gap-1"><Maximize2 className="w-3 h-3" /><span>Scroll to zoom</span></div>
              <div className="flex items-center gap-1"><Search className="w-3 h-3" /><span>Lupa circular</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {image && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-secondary/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Zoom: {zoom}%</span>
            <span>Rotación: {rotation}°</span>
            {magnifierEnabled && <span className="text-primary flex items-center gap-1"><Search className="w-3 h-3" /> Lupa ×{MAGNIFIER_ZOOM}</span>}
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-xs">
            <Download className="w-3 h-3 mr-1" />Export
          </Button>
        </div>
      )}
    </Card>
  )
}

export { XrayViewerWithMagnifier as XrayViewer }
