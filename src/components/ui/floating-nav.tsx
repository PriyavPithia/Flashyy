import { Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
interface FloatingNavProps {
  onAddCards: () => void;
  onPractice: () => void;
  isAdding: boolean;
}
export function FloatingNav({
  onAddCards,
  onPractice,
  isAdding
}: FloatingNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  return <div className="fixed top-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className="absolute top-16 right-0 mt-2 space-y-2">
            <Button variant="outline" onClick={() => {
          setIsOpen(false);
          isAdding ? onPractice() : onAddCards();
        }} className="w-full backdrop-blur-sm mt-[-10px] text-inherit bg-white py-[22px] text-base px-[21px]">
              {isAdding ? "Start Practice" : "Add Cards"}
            </Button>
          </motion.div>}
      </AnimatePresence>
      <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} className="h-10 w-10 rounded-full mt-[-10px] bg-white">
        <Menu className="h-6 w-6" />
      </Button>
    </div>;
}