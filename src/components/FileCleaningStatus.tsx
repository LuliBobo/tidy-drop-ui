import { CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

type CleanStatus = 'idle' | 'cleaning' | 'success' | 'error'

interface FileItem {
  file: File
  path: string
  status: CleanStatus
  outputPath?: string
}

interface FileCleaningStatusProps {
  files: FileItem[]
}

export function FileCleaningStatus({ files }: FileCleaningStatusProps) {
  const getStatusIcon = (status: CleanStatus) => {
    switch (status) {
      case 'idle':
        return <Clock className="h-4 w-4 text-muted-foreground" />
      case 'cleaning':
        return <Loader2 className="h-4 w-4 animate-spin text-droptidy-purple" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusText = (status: CleanStatus) => {
    switch (status) {
      case 'idle':
        return 'Waiting'
      case 'cleaning':
        return 'Cleaning metadata...'
      case 'success':
        return 'Cleaned successfully'
      case 'error':
        return 'Error cleaning metadata'
    }
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-center text-muted-foreground">No files selected</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {files.map((item, index) => (
        <Card key={`${item.path}-${index}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="mt-1">{getStatusIcon(item.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium truncate">{item.file.name}</p>
                  <span className={cn(
                    "text-sm",
                    item.status === 'error' && "text-red-500",
                    item.status === 'success' && "text-green-500",
                    item.status === 'cleaning' && "text-droptidy-purple",
                    item.status === 'idle' && "text-muted-foreground"
                  )}>
                    {getStatusText(item.status)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {item.path}
                </p>
                {item.outputPath && item.status === 'success' && (
                  <p className="text-sm text-green-500 truncate mt-1">
                    Cleaned file: {item.outputPath}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}