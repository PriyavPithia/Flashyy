import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Palette, Trash2 } from "lucide-react";
import { useState } from "react";
import { Group, GroupColor, GROUP_COLORS } from "@/types/flashcard";
import { cn } from "@/lib/utils";
import { EditableText } from "@/components/EditableText";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
    <div className="relative w-full max-w-4xl mx-auto mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Your Groups</h3>
        <Dialog open={isAddingGroup} onOpenChange={setIsAddingGroup}>
          <DialogTrigger asChild>
            <Button variant="outline">New Group</Button>
          </DialogTrigger>
          <DialogContent>
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

      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full px-4"
        >
          <CarouselContent className="-ml-2">
            {groups.map((group) => (
              <CarouselItem key={group.id} className="pl-2 basis-[200px] md:basis-[240px]">
                <Card
                  className={cn(
                    "p-4 transition-all duration-300 flex flex-col gap-2 cursor-pointer h-[100px] md:h-[120px]",
                    "hover:shadow-md relative",
                    externalSelectedGroupId === group.id && "shadow-lg bg-opacity-90"
                  )}
                  style={{ 
                    backgroundColor: group.color,
                    transform: externalSelectedGroupId === group.id ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onClick={() => onSelectGroup(group.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 max-w-[120px] md:max-w-[160px]">
                      <Folder className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
                      <EditableText
                        value={group.name}
                        onSave={(newName) => onUpdateGroup(group.id, { name: newName })}
                        className="font-medium truncate text-sm md:text-base"
                      />
                    </div>
                    {externalSelectedGroupId === group.id && (
                      <div className="flex items-center gap-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-black/5 shrink-0"
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
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mt-auto">
                    {cards.filter(card => card.group_id === group.id).length} {cards.filter(card => card.group_id === group.id).length === 1 ? "Flashcard" : "Flashcards"}
                  </p>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-2 h-7 w-7 md:h-8 md:w-8 md:-left-4" />
          <CarouselNext className="-right-2 h-7 w-7 md:h-8 md:w-8 md:-right-4" />
        </Carousel>
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