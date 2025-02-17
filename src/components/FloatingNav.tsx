import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Menu, Play, Plus, Settings, LogOut } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface FloatingNavProps {
  isAdding: boolean;
  onToggleMode: () => void;
  onPracticeSetup: () => void;
  showPracticeSetup: boolean;
}

export function FloatingNav({ 
  isAdding, 
  onToggleMode,
  onPracticeSetup,
  showPracticeSetup
}: FloatingNavProps) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

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

  return (
    <div className="fixed top-4 right-4 z-50 md:hidden">
      <div className="relative">
        <Button
          variant="outline" 
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 w-10 rounded-full bg-white shadow-lg"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-12 right-0 min-w-[200px] bg-white rounded-lg shadow-lg overflow-hidden"
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 