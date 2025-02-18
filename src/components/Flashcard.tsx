import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    setIsDragging(false);
    
    if (Math.abs(offset.x) > 100) {
      const direction = offset.x > 0 ? "right" : "left";
      onSwipe(direction);
    }
  };

  return (
    <div className="relative w-full max-w-md aspect-[3/4] perspective">
      <AnimatePresence>
        <motion.div
          key={question}
          className="w-full h-full"
          initial={{ x: direction === "left" ? 1000 : -1000 }}
          animate={{ x: 0 }}
          exit={{ x: direction === "left" ? -1000 : 1000 }}
          transition={{ 
            type: "tween",
            duration: 0.3,
            ease: "easeOut"
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
        >
          <div 
            className={`w-full h-full transition-transform duration-500 transform-gpu preserve-3d ${isFlipped ? "rotate-y-180" : ""}`} 
            onClick={() => !isDragging && setIsFlipped(!isFlipped)}
          >
            {/* Front of card */}
            <div className="absolute w-full h-full backface-hidden">
              <div 
                style={{ backgroundColor: groupColor }} 
                className="w-full h-full backdrop-blur-sm rounded-3xl shadow-lg p-4 md:p-6 flex flex-col"
              >
                <span className="mb-2 md:mb-4 text-center text-sm md:text-md text-black/50 font-medium">{groupName}</span>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-lg md:text-2xl font-medium text-center text-black/90 px-2">
                    {question}
                  </p>
                </div>
              </div>
            </div>

            {/* Back of card */}
            <div className="absolute w-full h-full backface-hidden rotate-y-180">
              <div 
                style={{ backgroundColor: groupColor }} 
                className="w-full h-full backdrop-blur-sm rounded-3xl shadow-lg py-4 md:py-6 px-2 flex flex-col"
              >
                <span className="text-center text-sm md:text-md text-black/50 font-medium">{groupName}</span>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="w-full max-w-[92%] mx-auto">
                    <div>
                      <p className="text-xs md:text-sm font-medium mb-1 md:mb-2 text-black/50">Question:</p>
                      <p className="text-sm md:text-xl font-medium leading-tight md:leading-[18px] text-black/90">{question}</p>
                    </div>
                    <div className="w-full h-px my-2 md:my-3" />
                    <div>
                      <p className="text-xs md:text-sm font-medium mb-1 md:mb-2 text-black/50">Answer:</p>
                      <p className="text-sm md:text-xl font-medium leading-tight md:leading-[18px] text-black/90">{answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}