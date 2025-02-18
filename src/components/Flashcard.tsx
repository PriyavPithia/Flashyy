import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface FlashcardProps {
  question: string;
  answer: string;
  onSwipe: (direction: "left" | "right") => void;
  groupName: string;
  groupColor: string;
  direction: "left" | "right";
}

export function Flashcard({ question, answer, onSwipe, groupName, groupColor, direction }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [exitX, setExitX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const isMobile = useIsMobile();

  // Adjusted thresholds for smoother mobile experience
  const swipeThreshold = isMobile ? 80 : 100;
  const velocityThreshold = isMobile ? 300 : 200;

  const handleDrag = (event: any, info: any) => {
    setDragX(info.offset.x);
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    setIsDragging(false);
    setDragX(0);
    
    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
      const direction = offset.x > 0 ? "right" : "left";
      setExitX(direction === "right" ? 1000 : -1000);
      onSwipe(direction);
    }
  };

  return (
    <div className="relative w-full max-w-md aspect-[3/4] perspective">
      <AnimatePresence mode="wait">
        <motion.div
          key={question}
          className="w-full h-full touch-pan-y"
          initial={{ 
            x: direction === "left" ? 1000 : -1000,
            opacity: 0,
            scale: 0.95
          }}
          animate={{ 
            x: 0,
            opacity: 1,
            scale: 1,
            rotate: dragX * 0.02,
            transition: {
              type: "spring",
              duration: 0.8,
              bounce: 0.2,
              damping: 20
            }
          }}
          exit={{ 
            x: exitX,
            opacity: 0,
            scale: 0.95,
            transition: { 
              duration: 0.5,
              ease: "easeOut"
            }
          }}
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.4}
          dragMomentum={false}
          onDrag={handleDrag}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          whileTap={{ cursor: "grabbing" }}
          whileDrag={{
            scale: 0.98
          }}
        >
          <div 
            className={`w-full h-full transition-transform duration-500 transform-gpu preserve-3d ${isFlipped ? "rotate-y-180" : ""}`} 
            onClick={() => !isDragging && setIsFlipped(!isFlipped)}
          >
            {/* Front of card */}
            <div className="absolute w-full h-full backface-hidden">
              <div 
                style={{ backgroundColor: groupColor }} 
                className="w-full h-full backdrop-blur-sm rounded-3xl shadow-lg p-6 flex flex-col"
              >
                <span className="mb-4 text-center text-md text-black/50 font-medium">{groupName}</span>
                <div className="flex-1 flex items-center justify-center">
                  <p className={`text-xl md:text-2xl font-medium text-center text-black/90 ${isMobile ? 'px-4' : ''}`}>
                    {question}
                  </p>
                </div>
                <div className="text-sm text-gray-500 text-center mt-4">
                  
                </div>
              </div>
            </div>
            

            {/* Back of card */}
            <div className="absolute w-full h-full backface-hidden rotate-y-180">
              <div 
                style={{ backgroundColor: groupColor }} 
                className="w-full h-full backdrop-blur-sm rounded-3xl shadow-lg py-6 px-2 flex flex-col"
              >
                <span className=" text-center text-md mt-[-5px] text-black/50 font-medium">{groupName}</span>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="w-full max-w-[90%] mx-auto">
                    <div>
                      <p className="text-sm font-medium mb-2 text-black/50">Question:</p>
                      <p className="text-[15px] md:text-xl font-medium leading-[18px] text-black/90">{question}</p>
                    </div>
                    <div className="w-full h-px  mt-3 mb-2" />
                    <div>
                      <p className="text-sm font-medium mb-2 text-black/50">Answer:</p>
                      <p className="text-[15px] md:text-xl font-medium leading-[18px] text-black/90">{answer}</p>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 text-center mt-4">
                  
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}