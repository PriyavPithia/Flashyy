import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Menu, Play, Plus, Settings, LogOut, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface FloatingNavProps {
  isAdding: boolean;
  onToggleMode: () => void;
  onPracticeSetup: () => void;
  showPracticeSetup: boolean;
  children: React.ReactNode;
}

export function FloatingNav({ 
  isAdding, 
  onToggleMode,
  onPracticeSetup,
  showPracticeSetup,
  children
}: FloatingNavProps) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully")
      navigate("/auth/signin")
    } catch (error) {
      toast.error("Error signing out")
      console.error(error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        ref={buttonRef}
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full bg-white shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )}
      </Button>

      <div
        ref={menuRef}
        className={cn(
          "absolute right-0 top-[calc(100%+8px)] w-48 rounded-lg bg-white p-2 shadow-lg",
          "transition-all duration-200",
          isOpen 
            ? "translate-y-0 opacity-100" 
            : "pointer-events-none translate-y-2 opacity-0"
        )}
      >
        <div className="py-1">
          {/* User Profile Section */}
          <div className="px-4 py-3 border-b flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Menu Items */}
          {isAdding ? (
            <Button
              variant="ghost"
              onClick={() => {
                onToggleMode();
                setIsOpen(false);
              }}
              className="w-full justify-start rounded-none px-4 py-2 text-sm"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Practice
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  onPracticeSetup();
                  setIsOpen(false);
                }}
                className="w-full justify-start rounded-none px-4 py-2 text-sm"
              >
                <Settings className="mr-2 h-4 w-4" />
                Practice Setup
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  onToggleMode();
                  setIsOpen(false);
                }}
                className="w-full justify-start rounded-none px-4 py-2 text-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Cards
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start rounded-none px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  )
} 