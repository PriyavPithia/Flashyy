import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Group, Card } from "@/types/flashcard";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PracticeSetupProps {
  groups: Group[];
  cards: Card[];
  onStart: (selectedCards: Card[], selectedGroups: string[]) => void;
  onCancel: () => void;
}

export function PracticeSetup({ groups, cards, onStart, onCancel }: PracticeSetupProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleStart = () => {
    const selectedCards = selectedGroups.length > 0
      ? cards.filter(card => selectedGroups.includes(card.group_id))
      : cards;
    onStart(selectedCards, selectedGroups);
  };

  const totalCards = selectedGroups.length > 0
    ? cards.filter(card => selectedGroups.includes(card.group_id)).length
    : cards.length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Practice Setup</h3>
          <p className="text-sm text-gray-500">
            Select the groups you want to practice, or practice all flashcards
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedGroups([])}
              className={cn(
                "text-sm",
                selectedGroups.length === 0 && "bg-gray-100"
              )}
            >
              All Flashcards ({cards.length} flashcards)
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedGroups(groups.map(g => g.id))}
              className={cn(
                "text-sm",
                selectedGroups.length === groups.length && "bg-gray-100"
              )}
            >
              Select All
            </Button>
          </div>

          <div className={cn(
            "grid grid-cols-2 gap-2 overflow-y-auto pr-2 custom-scrollbar",
            "h-[240px]"
          )}>
            {groups.map(group => {
              const groupCards = cards.filter(card => card.group_id === group.id);
              const isSelected = selectedGroups.includes(group.id);

              return (
                <button
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    "p-4 rounded-lg text-left transition-all",
                    "hover:shadow-md h-[110px]"
                  )}
                  style={{ backgroundColor: group.color }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{group.name}</h4>
                      <p className="text-sm mt-[30px] text-gray-600">
                        {groupCards.length} flashcards
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleStart} disabled={totalCards === 0}>
            <Check className="h-4 w-4 mr-2" />
            Start Practice
          </Button>
        </div>
      </div>
    </div>
  );
} 