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
  const isMobile = useIsMobile();

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      setExitX(-250);
      onSwipe("left");
    } else if (swipe > swipeConfidenceThreshold) {
      setExitX(250);
      onSwipe("right");
    }
  };

  return (
    <div className="relative w-full max-w-md aspect-[3/4] perspective">
      <AnimatePresence mode="wait">
        <motion.div
          key={question}
          className="w-full h-full"
          initial={{ 
            x: direction === "left" ? 1000 : -1000,
            opacity: 0,
            scale: 0.5
          }}
          animate={{ 
            x: 0,
            opacity: 1,
            scale: 1
          }}
          exit={{ 
            x: exitX,
            opacity: 0,
            scale: 0.5,
            transition: { duration: 0.2 }
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(e, info) => {
            setIsDragging(false);
            handleDragEnd(e, info);
          }}
          whileTap={{ cursor: "grabbing" }}
        >
          <div 
            className={`w-full h-full transition-transform duration-500 transform-gpu preserve-3d ${isFlipped ? "rotate-y-180" : ""}`} 
            onClick={() => !isDragging && setIsFlipped(!isFlipped)}
          >
            {/* Front of card */}
            <div className="absolute w-full h-full backface-hidden">
              <div 
                style={{ backgroundColor: groupColor }} 
                className="w-full h-full backdrop-blur-sm rounded-xl shadow-lg p-6 flex flex-col"
              >
                <span className="mb-4 text-center text-lg text-gray-500 font-medium">{groupName}</span>
                <div className="flex-1 flex items-center justify-center">
                  <p className={`text-xl md:text-2xl font-medium text-center ${isMobile ? 'px-4' : ''}`}>
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
                className="w-full h-full backdrop-blur-sm rounded-xl shadow-lg py-6 px-2 flex flex-col"
              >
                <span className="mb-4 text-center text-lg text-gray-500 font-medium">{groupName}</span>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="w-full max-w-[90%] mx-auto">
                    <div>
                      <p className="text-sm font-medium mb-2 text-gray-500">Question:</p>
                      <p className="text-[15px] md:text-xl font-medium leading-[18px]">{question}</p>
                    </div>
                    <div className="w-full h-px bg-gray-500 hover:bg-gray-400 mt-4 mb-3" />
                    <div>
                      <p className="text-sm font-medium mb-2 text-gray-500">Answer:</p>
                      <p className="text-[15px] md:text-xl font-medium leading-[18px]">{answer}</p>
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