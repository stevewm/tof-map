interface RouteStepProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  coordinates?: { x: number; y: number; z: number }
}

export default function RouteStep({ icon, title, subtitle, coordinates }: RouteStepProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        {coordinates && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            ({coordinates.x}, {coordinates.y}, {coordinates.z})
          </p>
        )}
      </div>
    </div>
  )
}