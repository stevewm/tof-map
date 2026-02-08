import { IconNavigationFilled } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

interface NavigateToButtonProps {
  onClick?: () => void
}

export default function NavigationButton({ onClick }: NavigateToButtonProps) {
  return (
    <Button 
      variant="outline" 
      title="Navigate to waypoint"
      onClick={onClick}
      >
      <IconNavigationFilled /> Navigate
    </Button>
  )
}