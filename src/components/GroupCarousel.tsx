import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Palette, Trash2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Group, GroupColor, GROUP_COLORS } from "@/types/flashcard";
import { cn } from "@/lib/utils";
import { EditableText } from "@/components/EditableText";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import React from "react";

interface GroupCarouselProps {
  groups: Group[];
  cards: { group_id: string }[];
  onUpdateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  onSelectGroup: (groupId: string) => void;
  selectedGroupId: string | null;
  onAddGroup: (group: { name: string; color: GroupColor }) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
}

export function GroupCarousel({ 
  groups, 
  cards, 
  onUpdateGroup, 
  onSelectGroup,
  selectedGroupId: externalSelectedGroupId,
  onAddGroup,
  onDeleteGroup
}: GroupCarouselProps) {
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedColor, setSelectedColor] = useState<GroupColor>(GROUP_COLORS.softGray);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 240; // Width of one card
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    try {
      const newGroup = {
        name: newGroupName,
        color: selectedColor,
      };

      await onAddGroup(newGroup);
      setNewGroupName("");
      setSelectedColor(GROUP_COLORS.softGray);
      setIsAddingGroup(false);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-10 overflow-hidden">
      <div className="flex justify-between items-center mt-4 mb-4">
        <h3 className="text-lg font-medium">Your Groups</h3>
        <Dialog open={isAddingGroup} onOpenChange={setIsAddingGroup}>
          <DialogTrigger asChild>
            <button
              className="h-10 w-10 rounded-full bg-black flex items-center justify-center transition-all hover:opacity-90"
            >
              <Plus className="h-4 w-4 text-white" />
            </button>
          </DialogTrigger>
          <DialogContent className="top-4 translate-y-0 sm:top-4 sm:translate-y-0 rounded-t-xl">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Name</label>
                <Input 
                  value={newGroupName} 
                  onChange={e => setNewGroupName(e.target.value)} 
                  placeholder="Enter group name"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddGroup();
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="grid grid-cols-5 gap-[2px] p-1">
                  {Object.entries(GROUP_COLORS).map(([name, color]) => (
                    <div
                      key={color}
                      className={`w-9 h-9 rounded-md cursor-pointer transition-all ${
                        selectedColor === color ? "ring-1 ring-black" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddGroup} className="w-full">
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative h-[140px] md:h-[160px] isolate">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-scroll hide-scrollbar gap-2 scroll-smooth snap-x snap-mandatory h-full"
          style={{ 
            scrollbarWidth: 'none',  // Firefox
            msOverflowStyle: 'none'  // IE and Edge
          }}
        >
          {groups.map((group) => (
            <div 
              key={group.id}
              className="flex-none w-[280px] md:w-[240px] lg:w-[300px] snap-start h-full"
            >
              <div
                className={cn(
                  "p-4 flex flex-col gap-2 h-full rounded-lg transition-all duration-200",
                  "shadow-sm cursor-pointer",
                  "hover:shadow-md",
                  externalSelectedGroupId === group.id && "shadow-lg"
                )}
                style={{ 
                  backgroundColor: group.color,
                  position: 'relative',
                  zIndex: 2,
                  WebkitTapHighlightColor: 'transparent'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const target = e.target as HTMLElement;
                  const isInteractiveElement = 
                    target.closest('button') || 
                    target.closest('.editable-text') ||
                    target.closest('.popover-trigger') ||
                    target.tagName.toLowerCase() === 'input';

                  if (!isInteractiveElement) {
                    onSelectGroup(group.id);
                    requestAnimationFrame(() => {
                      window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                      });
                    });
                  }
                }}
              >
                <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5 max-w-[180px] md:max-w-[160px]">
                    <Folder className="h-6 w-6 shrink-0 md:h-5 md:w-5 text-gray-600" />
                    <EditableText
                      value={group.name}
                      onSave={(newName) => onUpdateGroup(group.id, { name: newName })}
                      className="font-medium truncate text-lg md:text-base editable-text"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="lg"
                          className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-black/5 shrink-0 popover-trigger"
                        >
                          <Palette className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[270px]">
                        <div className="grid grid-cols-5 gap-[2px] p-1">
                          {Object.entries(GROUP_COLORS).map(([name, color]) => (
                            <div
                              key={color}
                              className={`w-9 h-9 rounded-md cursor-pointer transition-all ${
                                group.color === color ? "ring-1 ring-black" : ""
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => {
                                onUpdateGroup(group.id, { color });
                                const button = document.activeElement as HTMLButtonElement;
                                button?.click();
                              }}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-black/5 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGroupToDelete(group.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm md:text-sm text-gray-600 mt-auto">
                  {cards.filter(card => card.group_id === group.id).length} {cards.filter(card => card.group_id === group.id).length === 1 ? "Flashcard" : "Flashcards"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={!!groupToDelete} onOpenChange={() => setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the group and all its flashcards. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (groupToDelete) {
                  onDeleteGroup(groupToDelete);
                  setGroupToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 