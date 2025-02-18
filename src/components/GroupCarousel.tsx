import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Palette, Trash2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState, useRef } from "react";
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
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left' 
        ? carouselRef.current.scrollLeft - scrollAmount
        : carouselRef.current.scrollLeft + scrollAmount;
      
      carouselRef.current.scrollTo({
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
        <h3 className="text-lg md:text-xl text-black/90 italic font-medium">Your Groups</h3>
        <Dialog open={isAddingGroup} onOpenChange={setIsAddingGroup}>
          <DialogTrigger asChild>
            <button
              className="h-10 w-10 rounded-full bg-black flex items-center justify-center transition-all hover:opacity-90"
            >
              <Plus className="h-4 w-4 text-white" />
            </button>
          </DialogTrigger>
          <DialogContent className="top-4 translate-y-0 sm:top-4 sm:translate-y-0 rounded-xl">
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
                <div className="grid grid-cols-6 gap-[5px] p-1">
                  {Object.entries(GROUP_COLORS).map(([name, color]) => (
                    <div
                      key={color}
                      className={`w-12 h-11 rounded-md  cursor-pointer transition-all ${
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

      <div className="relative group">
        {/* Left Arrow */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-[0px] z-2 top-1/2 transform -translate-y-1/2 z-10
                     hidden md:flex items-center justify-center w-7 h-7 
                     bg-white rounded-full shadow-md hover:shadow-lg transition-all
                     opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-[0px] z-20 top-1/2 transform -translate-y-1/2 
                     hidden md:flex items-center justify-center w-7 h-7 
                     bg-white rounded-full shadow-md hover:shadow-lg transition-all
                     opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>

        {/* Scrollable container */}
        <div 
          ref={carouselRef}
          className="overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex gap-3 px-5 pb-4 pt-1 ">
            {/* Add Group Button */}
            <button
              onClick={() => setIsAddingGroup(true)}
              className="flex-none w-[120px] md:w-[180px] h-[120px] md:h-[130px] rounded-xl bg-black/5 
                         hover:bg-black/10 transition-colors flex flex-col items-center 
                         justify-center gap-2 group/add shadow-sm ml-[-20px] "
            >
              <Plus className="h-5 w-5 text-black/70 group-hover/add:scale-110 transition-transform" />
              <span className="text-sm md:text-base font-medium text-black/70">New Group</span>
            </button>

            {/* Group Cards */}
            {groups.map((group) => (
              <div 
                key={group.id}
                className="flex-none w-[210px] md:w-[240px] lg:w-[300px] snap-start h-[120px] md:h-[130px]"
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
                    <div className="flex items-center  max-w-[180px] md:max-w-[160px]">
                      <Folder className="h-5 w-5 shrink-0 md:h-5 md:w-5 text-black/70" />
                      <EditableText
                        value={group.name}
                        onSave={(newName) => onUpdateGroup(group.id, { name: newName })}
                        className="font-medium truncate text-base md:text-base editable-text"
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
                          <div className="grid grid-cols-5 gap-[8px]">
                            {Object.entries(GROUP_COLORS).map(([name, color]) => (
                              <div
                                key={color}
                                className={`w-11 h-11 rounded-md cursor-pointer transition-all ${
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
                  <p className="text-xs md:text-sm text-black/70 mt-auto">
                    {cards.filter(card => card.group_id === group.id).length} {cards.filter(card => card.group_id === group.id).length === 1 ? "Flashcard" : "Flashcards"}
                  </p>
                </div>
              </div>
            ))}
          </div>
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