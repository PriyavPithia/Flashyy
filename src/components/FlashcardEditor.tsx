import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditableText } from "@/components/EditableText";
import { Trash2, ChevronDown, Palette } from "lucide-react";
import { Card, Group, GroupColor, GROUP_COLORS } from "@/types/flashcard";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FlashcardEditorProps {
  card: Card;
  groups: Group[];
  onUpdateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  onUpdateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
}

// Remove the ExpandableAnswer component and replace it with a simpler Answer section
function AnswerSection({ 
  card, 
  onUpdateCard,
}: { 
  card: Card; 
  onUpdateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
}) {
  return (
    <div>
      <div 
        className="px-4 py-4"
        style={{
          backgroundColor: 'inherit'
        }}
      >
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Answer</label>
          <EditableText
            value={card.answer}
            onSave={(newAnswer) => onUpdateCard(card.id, { answer: newAnswer })}
            className="block w-full text-gray-700"
          />
        </div>
      </div>
    </div>
  );
}

export function FlashcardEditor({ 
  card, 
  groups, 
  onUpdateCard,
  onUpdateGroup, 
  onDeleteCard,
}: FlashcardEditorProps) {
  const currentGroup = groups.find(g => g.id === card.group_id);

  return (
    <div 
      className={cn(
        "rounded-xl shadow-md transition-all hover:shadow-lg overflow-hidden",
        "flex-none w-[290px] md:w-full h-fit",
        "relative"
      )}
      style={{
        backgroundColor: currentGroup?.color || GROUP_COLORS.softGray
      }}
    >
      <div className="flex items-center justify-between pt-4 pb-0 pr-4 pl-4">
        <div className="flex items-center">
          <div 
            className="h-2 rounded-full" 
            style={{ backgroundColor: currentGroup?.color || GROUP_COLORS.softGray }}
          />
          <EditableText
            value={currentGroup?.name || 'Ungrouped'}
            onSave={(newName) => currentGroup && onUpdateGroup(currentGroup.id, { name: newName })}
            className="text-md ml-[-8px] font-medium text-black"
          />
        </div>
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              
            </PopoverTrigger>
            <PopoverContent className="w-[270px]">
              <div className="grid grid-cols-5 gap-[5px] p-1">
                {Object.entries(GROUP_COLORS).map(([name, color]) => (
                  <div
                    key={color}
                    className={`w-10 h-10 rounded-md cursor-pointer transition-all ${
                      currentGroup?.color === color ? "ring-1 ring-black" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => currentGroup && onUpdateGroup(currentGroup.id, { color })}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 hover:bg-black/5"
            onClick={() => onDeleteCard(card.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 pt-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-black/70">Question</label>
          <EditableText
            value={card.question}
            onSave={(newQuestion) => onUpdateCard(card.id, { question: newQuestion })}
            className="block w-full text-black/90"
          />
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-black/70">Answer</label>
          <EditableText
            value={card.answer}
            onSave={(newAnswer) => onUpdateCard(card.id, { answer: newAnswer })}
            className="block w-full text-black/90"
          />
        </div>
      </div>
    </div>
  );
} 