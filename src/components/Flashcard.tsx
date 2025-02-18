import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanInfo } from "framer-motion";

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
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (_: any, info: PanInfo) => {
    setDragPosition({ x: info.offset.x, y: info.offset.y });
  };

  const handleDragEnd = (_: any, { offset, velocity }: PanInfo) => {
    setIsDragging(false);
    setDragPosition({ x: 0, y: 0 });
    
    if (Math.abs(offset.x) > 100 || Math.abs(velocity.x) > 500) {
      const direction = offset.x > 0 ? "right" : "left";
      onSwipe(direction);
    }
  };

  // Calculate rotation and scale based on drag position
  const rotateValue = dragPosition.x * 0.1; // More rotation for more dramatic effect
  const scaleValue = Math.max(1 - Math.abs(dragPosition.x) * 0.001, 0.85); // Scale down as card is dragged
  const opacity = Math.max(1 - Math.abs(dragPosition.x) * 0.002, 0.5); // Fade as card is dragged

  return (
    <div className="relative w-full max-w-md aspect-[3/4] perspective">
      <AnimatePresence>
        <motion.div
          key={question}
          className="w-full h-full"
          initial={{ 
            x: direction === "left" ? 1000 : -1000,
            rotate: direction === "left" ? 50 : -50,
            opacity: 0
          }}
          animate={{ 
            x: dragPosition.x,
            y: dragPosition.y,
            rotate: rotateValue,
            scale: scaleValue,
            opacity: opacity
          }}
          exit={{ 
            x: direction === "left" ? -1000 : 1000,
            rotate: direction === "left" ? -50 : 50,
            opacity: 0,
            transition: { duration: 0.4 }
          }}
          transition={{ 
            type: "tween",
            duration: 0.2
          }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.9}
          onDrag={handleDrag}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{
            cursor: isDragging ? "grabbing" : "grab"
          }}
        >
          <div 
            className={`w-full h-full transition-transform duration-500 transform-gpu preserve-3d ${isFlipped ? "rotate-y-180" : ""}`} 
            onClick={() => !isDragging && setIsFlipped(!isFlipped)}
          >
            {/* Front of card */}
            <div className="absolute w-full px-2 h-full backface-hidden">
              <div 
                style={{ backgroundColor: groupColor }} 
                className="w-full  h-full backdrop-blur-sm rounded-3xl shadow-lg p-4 md:p-6 flex flex-col"
              >
                <span className="mb-2 md:mb-4 text-center text-sm md:text-md text-black/50 font-medium">{groupName}</span>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xl md:text-2xl font-medium text-center text-black/90 px-2">
                    {question}
                  </p>
                </div>
              </div>
            </div>

            {/* Back of card */}
            <div className="absolute w-full h-full px-2 backface-hidden rotate-y-180">
              <div 
                style={{ backgroundColor: groupColor }} 
                className="w-full h-full backdrop-blur-sm rounded-3xl shadow-lg py-4 md:py-6 px-2 flex flex-col"
              >
                <span className="text-center text-sm md:text-md text-black/50 font-medium">{groupName}</span>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="w-full max-w-[92%] mx-auto">
                    <div>
                      <p className="text-xs md:text-sm font-medium mb-1 md:mb-2 text-black/50">Question:</p>
                      <p className="text-base md:text-lg font-medium leading-tight md:leading-[23px] text-black/90">{question}</p>
                    </div>
                    <div className="w-full h-px my-2 md:my-3" />
                    <div>
                      <p className="text-xs md:text-sm font-medium mb-1 md:mb-2 text-black/50">Answer:</p>
                      <p className="text-base md:text-lg font-medium leading-tight md:leading-[23px] text-black/90">{answer}</p>
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