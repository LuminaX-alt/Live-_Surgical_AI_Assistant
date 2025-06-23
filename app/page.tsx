"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert as AlertUI, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Play,
  Pause,
  Square,
  AlertTriangle,
  Eye,
  Activity,
  Camera,
  Settings,
  Download,
  Zap,
  User,
  Calendar,
  Clock,
  Shield,
  Wifi,
  Server,
  Menu,
  X,
} from "lucide-react"

interface Detection {
  id: string
  type: "anatomy" | "tool" | "risk"
  label: string
  confidence: number
  bbox: { x: number; y: number; width: number; height: number }
  color: string
}

interface Alert {
  id: string
  type: "warning" | "critical" | "info"
  message: string
  timestamp: Date
}

interface ProtocolStep {
  id: string
  step: string
  status: "completed" | "current" | "upcoming"
  confidence: number
}

interface PatientInfo {
  id: string
  name: string
  age: number
  procedure: string
  surgeon: string
  startTime: Date
}

export default function LuminaXSurgicalSystem() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [detections, setDetections] = useState<Detection[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [protocolSteps, setProtocolSteps] = useState<ProtocolStep[]>([
    { id: "1", step: "Initial trocar placement", status: "completed", confidence: 95 },
    { id: "2", step: "CO2 insufflation", status: "completed", confidence: 92 },
    { id: "3", step: "Camera insertion and orientation", status: "current", confidence: 88 },
    { id: "4", step: "Identify key anatomical landmarks", status: "upcoming", confidence: 0 },
    { id: "5", step: "Dissection of Calot's triangle", status: "upcoming", confidence: 0 },
  ])
  const [patientInfo] = useState<PatientInfo>({
    id: "P-2024-001",
    name: "Sarah Johnson",
    age: 45,
    procedure: "Laparoscopic Cholecystectomy",
    surgeon: "Dr. Michael Chen",
    startTime: new Date(),
  })
  const [fps, setFps] = useState(30)
  const [processingTime, setProcessingTime] = useState(12)
  const [systemStatus, setSystemStatus] = useState({
    connection: "Connected",
    aiModel: "Active",
    recording: "Standby",
    alerts: 0,
  })

  // Mock video stream setup
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current
      video.src = "/placeholder.svg?height=480&width=640"
      video.loop = true
      video.muted = true
    }
  }, [])

  // Mock AI detection simulation
  useEffect(() => {
    if (!isAnalyzing) return

    const interval = setInterval(() => {
      const mockDetections: Detection[] = [
        {
          id: "1",
          type: "anatomy",
          label: "Gallbladder",
          confidence: 94,
          bbox: { x: 120, y: 80, width: 180, height: 120 },
          color: "#10B981",
        },
        {
          id: "2",
          type: "anatomy",
          label: "Hepatic Artery",
          confidence: 87,
          bbox: { x: 200, y: 150, width: 80, height: 40 },
          color: "#EF4444",
        },
        {
          id: "3",
          type: "tool",
          label: "Laparoscopic Grasper",
          confidence: 96,
          bbox: { x: 350, y: 200, width: 120, height: 60 },
          color: "#3B82F6",
        },
        {
          id: "4",
          type: "tool",
          label: "Electrocautery",
          confidence: 91,
          bbox: { x: 450, y: 120, width: 100, height: 80 },
          color: "#8B5CF6",
        },
      ]

      if (Math.random() > 0.7) {
        mockDetections.push({
          id: "5",
          type: "risk",
          label: "Proximity Alert: Hepatic Artery",
          confidence: 89,
          bbox: { x: 180, y: 140, width: 120, height: 60 },
          color: "#F59E0B",
        })

        const newAlert: Alert = {
          id: Date.now().toString(),
          type: "warning",
          message: "Instrument approaching hepatic artery - maintain safe distance",
          timestamp: new Date(),
        }
        setAlerts((prev) => [newAlert, ...prev.slice(0, 4)])
        setSystemStatus((prev) => ({ ...prev, alerts: prev.alerts + 1 }))
      }

      setDetections(mockDetections)
      drawOverlays(mockDetections)
    }, 100)

    return () => clearInterval(interval)
  }, [isAnalyzing])

  const drawOverlays = (detections: Detection[]) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    detections.forEach((detection) => {
      const { bbox, color, label, confidence } = detection

      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height)

      ctx.fillStyle = color
      ctx.fillRect(bbox.x, bbox.y - 30, label.length * 9 + 30, 30)

      ctx.fillStyle = "white"
      ctx.font = "bold 14px Arial"
      ctx.fillText(`${label} (${confidence}%)`, bbox.x + 8, bbox.y - 10)
    })
  }

  const startAnalysis = () => {
    setIsAnalyzing(true)
    setSystemStatus((prev) => ({ ...prev, aiModel: "Active" }))
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  const stopAnalysis = () => {
    setIsAnalyzing(false)
    setSystemStatus((prev) => ({ ...prev, aiModel: "Standby" }))
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setDetections([])
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    setSystemStatus((prev) => ({
      ...prev,
      recording: !isRecording ? "Recording" : "Standby",
    }))

    if (!isRecording) {
      const newAlert: Alert = {
        id: Date.now().toString(),
        type: "info",
        message: "Recording started - all detections and annotations will be logged",
        timestamp: new Date(),
      }
      setAlerts((prev) => [newAlert, ...prev.slice(0, 4)])
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getElapsedTime = () => {
    const elapsed = Date.now() - patientInfo.startTime.getTime()
    const minutes = Math.floor(elapsed / 60000)
    const seconds = Math.floor((elapsed % 60000) / 1000)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LuminaX</h1>
                <p className="text-sm text-gray-600">Surgical AI Assistant</p>
              </div>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Status indicators */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">{systemStatus.connection}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">{systemStatus.aiModel}</span>
            </div>
            <Badge variant={isAnalyzing ? "default" : "secondary"}>{isAnalyzing ? "ANALYZING" : "STANDBY"}</Badge>
            <Badge variant={isRecording ? "destructive" : "outline"}>{isRecording ? "REC" : "READY"}</Badge>
          </div>
        </div>

        {/* Mobile status bar */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">{systemStatus.connection}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">{systemStatus.aiModel}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Patient Information Bar */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{patientInfo.name}</p>
                  <p className="text-xs text-gray-600">ID: {patientInfo.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{patientInfo.procedure}</p>
                  <p className="text-xs text-gray-600">Age: {patientInfo.age}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{patientInfo.surgeon}</p>
                  <p className="text-xs text-gray-600">Lead Surgeon</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{getElapsedTime()}</p>
                  <p className="text-xs text-gray-600">Started: {formatTime(patientInfo.startTime)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Video Feed - Takes up more space on larger screens */}
          <div className="xl:col-span-3 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Live Surgical Feed</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>FPS: {fps}</span>
                    <span>•</span>
                    <span>{processingTime}ms</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-auto max-h-[500px] object-cover"
                    width={640}
                    height={480}
                    poster="/placeholder.svg?height=480&width=640"
                  />
                  <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" width={640} height={480} />

                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={isAnalyzing ? stopAnalysis : startAnalysis}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {isAnalyzing ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                            {isAnalyzing ? "Stop" : "Start"} AI
                          </Button>
                          <Button
                            size="sm"
                            variant={isRecording ? "destructive" : "outline"}
                            onClick={toggleRecording}
                            className={
                              isRecording
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-white/20 hover:bg-white/30 text-white border-white/30"
                            }
                          >
                            <Square className="h-4 w-4 mr-2" />
                            {isRecording ? "Stop" : "Record"}
                          </Button>
                        </div>

                        <div className="flex items-center space-x-4 text-white text-sm">
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${isAnalyzing ? "bg-green-400" : "bg-gray-400"}`} />
                            <span>AI {isAnalyzing ? "Active" : "Standby"}</span>
                          </div>
                          {isRecording && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                              <span>Recording</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Performance - Responsive grid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">GPU Utilization</Label>
                    <Progress value={78} className="mt-2 h-3" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>78%</span>
                      <span>NVIDIA RTX A6000</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Memory Usage</Label>
                    <Progress value={65} className="mt-2 h-3" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>6.5GB / 10GB</span>
                      <span>System RAM</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Processing Latency</Label>
                    <Progress value={25} className="mt-2 h-3" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{processingTime}ms</span>
                      <span>Target: &lt;20ms</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Critical Alerts */}
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Critical Alerts</span>
                  {systemStatus.alerts > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {systemStatus.alerts}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-4">
                    <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">All systems normal</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <AlertUI
                      key={alert.id}
                      className={`${
                        alert.type === "critical"
                          ? "border-red-500 bg-red-50"
                          : alert.type === "warning"
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-blue-500 bg-blue-50"
                      } border-l-4`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-xs text-gray-500 mt-1">{alert.timestamp.toLocaleTimeString()}</div>
                      </AlertDescription>
                    </AlertUI>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Surgical Protocol */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span>Protocol Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {protocolSteps.map((step, index) => (
                    <div key={step.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            step.status === "completed"
                              ? "bg-green-500 border-green-500"
                              : step.status === "current"
                                ? "bg-blue-500 border-blue-500"
                                : "bg-gray-200 border-gray-300"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            step.status === "current"
                              ? "font-semibold text-blue-700"
                              : step.status === "completed"
                                ? "text-gray-700"
                                : "text-gray-500"
                          }`}
                        >
                          {step.step}
                        </p>
                        {step.confidence > 0 && (
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={step.confidence} className="h-1 flex-1" />
                            <span className="text-xs text-gray-500">{step.confidence}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Detections */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <span>AI Detections</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="anatomy" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 text-xs">
                    <TabsTrigger value="anatomy" className="text-xs">
                      Anatomy
                    </TabsTrigger>
                    <TabsTrigger value="tools" className="text-xs">
                      Tools
                    </TabsTrigger>
                    <TabsTrigger value="risks" className="text-xs">
                      Risks
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="anatomy" className="space-y-2 mt-4">
                    {detections.filter((d) => d.type === "anatomy").length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No anatomy detected</p>
                    ) : (
                      detections
                        .filter((d) => d.type === "anatomy")
                        .map((detection) => (
                          <div
                            key={detection.id}
                            className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                          >
                            <span className="text-sm font-medium text-green-800">{detection.label}</span>
                            <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                              {detection.confidence}%
                            </Badge>
                          </div>
                        ))
                    )}
                  </TabsContent>

                  <TabsContent value="tools" className="space-y-2 mt-4">
                    {detections.filter((d) => d.type === "tool").length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No tools detected</p>
                    ) : (
                      detections
                        .filter((d) => d.type === "tool")
                        .map((detection) => (
                          <div
                            key={detection.id}
                            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <span className="text-sm font-medium text-blue-800">{detection.label}</span>
                            <Badge variant="outline" className="bg-white text-blue-700 border-blue-300">
                              {detection.confidence}%
                            </Badge>
                          </div>
                        ))
                    )}
                  </TabsContent>

                  <TabsContent value="risks" className="space-y-2 mt-4">
                    {detections.filter((d) => d.type === "risk").length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No risks detected</p>
                    ) : (
                      detections
                        .filter((d) => d.type === "risk")
                        .map((detection) => (
                          <div
                            key={detection.id}
                            className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                          >
                            <span className="text-sm font-medium text-yellow-800">{detection.label}</span>
                            <Badge variant="outline" className="bg-white text-yellow-700 border-yellow-300">
                              {detection.confidence}%
                            </Badge>
                          </div>
                        ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Hospital Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Hospital Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export to PACS
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Review Session
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Compliance Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
