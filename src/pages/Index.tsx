import { useState, useEffect } from "react";
import { AddCardForm } from "@/components/AddCardForm";
import { BulkAddForm } from "@/components/BulkAddForm";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, Group, GROUP_COLORS, GroupColor } from "@/types/flashcard";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FloatingNav } from "@/components/FloatingNav";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";
import { Palette, Trash2 } from "lucide-react";
import { EditableText } from "@/components/EditableText";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GroupCarousel } from "@/components/GroupCarousel";
import { Folder } from "lucide-react";
import { PracticeSetup } from "@/components/PracticeSetup";
import logo from "../../public/assets/flashyylogo.png";
import { cn } from "@/lib/utils";

const Index = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(true);
  const [addMode, setAddMode] = useState<"single" | "bulk">("single");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedColor, setSelectedColor] = useState<GroupColor>(GROUP_COLORS.softGray);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right">("right");
  const isMobile = useIsMobile();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [showPracticeSetup, setShowPracticeSetup] = useState(false);
  const [practiceCards, setPracticeCards] = useState<Card[]>([]);
  const [currentPracticeSetup, setCurrentPracticeSetup] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadGroups();
      loadCards();
    }
  }, [user]);

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load groups');
    }
  };

  const loadCards = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error loading cards:', error);
      toast.error('Failed to load cards');
    }
  };

  const shuffleCards = (cards: Card[]) => {
    return [...cards].sort(() => Math.random() - 0.5);
  };

  const handleAddCard = async (question: string, answer: string) => {
    if (!selectedGroupId || !user) {
      toast.error("Please select or create a group first");
      return;
    }

    try {
      const newCard = {
        question,
        answer,
        group_id: selectedGroupId,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('cards')
        .insert([newCard])
        .select()
        .single();

      if (error) throw error;
      setCards(prev => [...prev, data]);
      toast.success('Card added successfully!');
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error('Failed to add card');
    }
  };

  const handleAddGroup = async (newGroup: { name: string; color: GroupColor }) => {
    if (!newGroup.name.trim() || !user) {
      toast.error("Please enter a group name");
      return;
    }

    try {
      const groupToAdd = {
        name: newGroup.name,
        color: newGroup.color,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('groups')
        .insert([groupToAdd])
        .select()
        .single();

      if (error) throw error;
      
      setGroups(prev => [...prev, data]);
      setSelectedGroupId(data.id);
      toast.success("Group created successfully!");
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
      throw error; // Re-throw to be caught by the GroupCarousel component
    }
  };

  const handleBulkAdd = async (newCards: Array<{ question: string; answer: string }>) => {
    if (!selectedGroupId || !user) {
      toast.error("Please select or create a group first");
      return;
    }

    try {
      const cardsToAdd = newCards.map(card => ({
        ...card,
        group_id: selectedGroupId,
        user_id: user.id
      }));

      const { data, error } = await supabase
        .from('cards')
        .insert(cardsToAdd)
        .select();

      if (error) throw error;
      setCards(prev => [...prev, ...data]);
      toast.success(`${data.length} cards added successfully!`);
    } catch (error) {
      console.error('Error adding cards:', error);
      toast.error('Failed to add cards');
    }
  };

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction);
    if (direction === "left") {
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        setCurrentCardIndex(0);
        toast.success("You've gone through all the cards!");
      }
    } else {
      if (currentCardIndex > 0) {
        setCurrentCardIndex(prev => prev - 1);
      } else {
        setCurrentCardIndex(cards.length - 1);
        toast("Went back to the last card", {
          duration: 2000
        });
      }
    }
  };

  const toggleMode = () => {
    if (!isAdding) {
      setIsAdding(true);
    } else if (cards.length === 0) {
      toast.error("Add some flashcards first!");
    } else {
      setShowPracticeSetup(true);
    }
  };

  const startPractice = (selectedCards: Card[], selectedGroups: string[]) => {
    setShowPracticeSetup(false);
    setIsAdding(false);
    setPracticeCards(shuffleCards(selectedCards));
    setCurrentCardIndex(0);
    setCurrentPracticeSetup(selectedGroups);
  };

  const getPracticeSetupText = () => {
    if (currentPracticeSetup.length === 0) return "All Flashcards";
    if (currentPracticeSetup.length === groups.length) return "All Groups";
    return groups
      .filter(g => currentPracticeSetup.includes(g.id))
      .map(g => g.name)
      .join(", ");
  };

  const currentCard = cards[currentCardIndex];
  const currentGroup = currentCard ? groups.find(g => g.id === currentCard.group_id) : null;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/auth/signin");
    } catch (error) {
      toast.error("Error signing out");
      console.error(error);
    }
  };

  const updateGroup = async (groupId: string, updates: Partial<Group>) => {
    try {
      // First, validate that the group exists and belongs to the user
      const { data: existingGroup } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (!existingGroup) {
        throw new Error('Group not found');
      }

      const { error } = await supabase
        .from('groups')
        .update({
          ...updates,
          user_id: user?.id // ensure user_id is included
        })
        .eq('id', groupId);

      if (error) throw error;
      
      // Update local state
      setGroups(prev => prev.map(group => 
        group.id === groupId ? { ...group, ...updates } : group
      ));
      
      toast.success('Group updated successfully!');
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update group');
    }
  };

  const updateCard = async (cardId: string, updates: Partial<Card>) => {
    try {
      // First, validate that the card exists and belongs to the user
      const { data: existingCard } = await supabase
        .from('cards')
        .select('*')
        .eq('id', cardId)
        .single();

      if (!existingCard) {
        throw new Error('Card not found');
      }

      const { error } = await supabase
        .from('cards')
        .update({
          ...updates,
          user_id: user?.id // ensure user_id is included
        })
        .eq('id', cardId);

      if (error) throw error;
      
      // Update local state
      setCards(prev => prev.map(card => 
        card.id === cardId ? { ...card, ...updates } : card
      ));
      
      toast.success('Card updated successfully!');
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error('Failed to update card');
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      // First, validate that the card exists and belongs to the user
      const { data: existingCard } = await supabase
        .from('cards')
        .select('*')
        .eq('id', cardId)
        .single();

      if (!existingCard) {
        throw new Error('Card not found');
      }

      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user?.id); // ensure we're only deleting user's own cards

      if (error) throw error;
      
      // Update local state
      setCards(prev => prev.filter(card => card.id !== cardId));
      toast.success('Card deleted successfully!');
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Failed to delete card');
    }
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    document.getElementById('add-card-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const deleteGroup = async (groupId: string) => {
    try {
      // First delete all cards in the group
      const { error: cardsError } = await supabase
        .from('cards')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user?.id);

      if (cardsError) throw cardsError;

      // Then delete the group
      const { error: groupError } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId)
        .eq('user_id', user?.id);

      if (groupError) throw groupError;
      
      // Update local state
      setCards(prev => prev.filter(card => card.group_id !== groupId));
      setGroups(prev => prev.filter(group => group.id !== groupId));
      if (selectedGroupId === groupId) {
        setSelectedGroupId("");
      }
      toast.success('Group deleted successfully!');
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    }
  };

  return <div className="flex h-screen">
    {/* Sidebar */}
    <div className="w-64 bg-gray-50 border-r p-4 hidden md:block">
      <div className="space-y-4">
        <img 
          src={logo} 
          alt="Flashyy" 
          className="h-10 w-auto mb-6" 
        />
        
        <div className="space-y-2">
          <Button 
            onClick={toggleMode} 
            className="w-full justify-start"
            variant={isAdding ? "outline" : "default"}
          >
            {isAdding ? "Start Practice" : "Add Cards"}
          </Button>

          {!isAdding && (
            <Button 
              variant="outline"
              onClick={() => setShowPracticeSetup(true)}
              className="w-full justify-start"
            >
              Change Practice Setup
            </Button>
          )}

          {isAdding && (
            <>
              <Button 
                variant={addMode === "single" ? "default" : "outline"} 
                onClick={() => setAddMode("single")} 
                className="w-full justify-start"
              >
                Single Card
              </Button>
              <Button 
                variant={addMode === "bulk" ? "default" : "outline"} 
                onClick={() => setAddMode("bulk")} 
                className="w-full justify-start"
              >
                Bulk Add
              </Button>
            </>
          )}
        </div>

        <div className="pt-4 border-t  items-center space-y-4">
          <div className="flex    space-y-2 py-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center ml-2">
              <p className="text-sm text-gray-600 font-medium">{user?.email}</p>
            </div>
          </div>
          
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-full justify-start"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 overflow-auto">
      <div className="px-[20px] h-full pt-[20px] pb-[15px]">
        <div className="max-w-4xl mx-auto h-[80%]">
          <div className="text-center mb-0 md:mb-12">
            <img 
              src={logo} 
              alt="Flashyy" 
              className="h-[60px] w-auto mx-auto mb-2" 
            />
            <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
              {isAdding ? "Add new flashcards to your collection" : "Swipe left/right or tap to flip cards"}
            </p>
            
            {/* Mobile-only buttons */}
            <div className="space-x-2 md:space-x-4 flex justify-center md:hidden">
              {isAdding ? (
                <>
                <Button 
                    onClick={toggleMode} 
                    className="mb-4  bg-white hover:bg-gray-200 text-black hover:text-black"
                    variant={addMode === "single" ? "default" : "outline"}
                  >
                    Start Practice
                  </Button>
                  <Button 
                    variant={addMode === "single" ? "default" : "outline"} 
                    onClick={() => setAddMode("single")} 
                    className="mb-4 bg-white hover:bg-gray-200 text-black hover:text-black"
                  >
                    Single Card
                  </Button>
                  <Button 
                    variant={addMode === "bulk" ? "default" : "outline"} 
                    onClick={() => setAddMode("bulk")} 
                    className="mb-4 bg-white hover:bg-gray-200 text-black hover:text-black"
                  >
                    Bulk Add
                  </Button>
                  
                </>
              ) : null}
            </div>
          </div>

          {isAdding && (
            <div className="mb-8">
              <GroupCarousel 
                groups={groups} 
                cards={cards} 
                onUpdateGroup={updateGroup}
                onSelectGroup={handleGroupSelect}
                selectedGroupId={selectedGroupId}
                onAddGroup={handleAddGroup}
                onDeleteGroup={deleteGroup}
              />
            </div>
          )}

          {isAdding && (
            <div id="add-card-section" className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {selectedGroupId && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">
                        Adding cards to: {groups.find(g => g.id === selectedGroupId)?.name}
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedGroupId("")}
                      >
                        Cancel
                      </Button>
                    </div>
                    {addMode === "single" ? (
                      <AddCardForm onAdd={handleAddCard} />
                    ) : (
                      <BulkAddForm onAdd={handleBulkAdd} />
                    )}
                  </div>
                )}

                {!selectedGroupId && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a Group
                    </h3>
                    <p className="text-sm text-gray-500">
                      Click on a group above to add cards to it
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-center mb-4">
                  {selectedGroupId 
                    ? `${groups.find(g => g.id === selectedGroupId)?.name} (${
                        cards.filter(card => card.group_id === selectedGroupId).length
                      })`
                    : `All Flashcards (${cards.length})`
                  }
                </h2>
                <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-4 custom-scrollbar">
                  {(selectedGroupId 
                    ? cards.filter(card => card.group_id === selectedGroupId)
                    : cards
                  ).map((card) => (
                    <div 
                      key={card.id} 
                      className="rounded-xl shadow-md p-4 space-y-2 transition-all hover:shadow-lg"
                      style={{
                        backgroundColor: groups.find(g => g.id === card.group_id)?.color || GROUP_COLORS.softGray
                      }}
                    >
                      <div className="flex items-center justify-between border-b border-gray-300 pb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: groups.find(g => g.id === card.group_id)?.color || GROUP_COLORS.softGray }}
                          />
                          <EditableText
                            value={groups.find(g => g.id === card.group_id)?.name || 'Ungrouped'}
                            onSave={(newName) => groups.find(g => g.id === card.group_id) && updateGroup(card.group_id, { name: newName })}
                            className="text-sm font-medium text-gray-700"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-black/5"
                              >
                                <Palette className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[270px]">
                              <div className="grid grid-cols-5 gap-[2px] p-1">
                                {Object.entries(GROUP_COLORS).map(([name, color]) => (
                                  <div
                                    key={color}
                                    className={`w-9 h-9 rounded-md cursor-pointer transition-all ${
                                      groups.find(g => g.id === card.group_id)?.color === color ? "ring-1 ring-black" : ""
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => groups.find(g => g.id === card.group_id) && updateGroup(card.group_id, { color })}
                                  />
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-black/5"
                            onClick={() => deleteCard(card.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-500">Question</label>
                          <EditableText
                            value={card.question}
                            onSave={(newQuestion) => updateCard(card.id, { question: newQuestion })}
                            className="block w-full text-gray-900"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-500">Answer</label>
                          <EditableText
                            value={card.answer}
                            onSave={(newAnswer) => updateCard(card.id, { answer: newAnswer })}
                            className="block w-full text-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isAdding && (
            <div className={cn(
              "flex flex-col justify-between",
              isMobile ? "h-[calc(100vh-180px)]" : "h-auto" // Adjust height for mobile
            )}>
              <div className="flex-1 flex justify-center items-center">
                {practiceCards.length > 0 ? (
                  <Flashcard 
                    key={practiceCards[currentCardIndex].id} 
                    question={practiceCards[currentCardIndex].question} 
                    answer={practiceCards[currentCardIndex].answer} 
                    onSwipe={handleSwipe} 
                    groupName={groups.find(g => g.id === practiceCards[currentCardIndex].group_id)?.name || ""} 
                    groupColor={groups.find(g => g.id === practiceCards[currentCardIndex].group_id)?.color || GROUP_COLORS.softGray}
                    direction={swipeDirection}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    No flashcards available. Add some first!
                  </div>
                )}
              </div>

              {cards.length > 0 && (
                <div className="text-center mt-4 mb-4">
                  <p className="text-sm text-gray-500">
                    Flashcard {currentCardIndex + 1} of {practiceCards.length}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Currently practicing: {getPracticeSetupText()} • 
                    <button 
                      onClick={() => setShowPracticeSetup(true)}
                      className="text-blue-500 hover:underline ml-1"
                    >
                      Change
                    </button>
                  </p>
                  
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Floating Navigation */}
    <FloatingNav 
      isAdding={isAdding} 
      onToggleMode={toggleMode}
      onPracticeSetup={() => setShowPracticeSetup(true)}
      showPracticeSetup={!isAdding}
    />

    {showPracticeSetup && (
      <PracticeSetup
        groups={groups}
        cards={cards}
        onStart={startPractice}
        onCancel={() => setShowPracticeSetup(false)}
      />
    )}
  </div>;
};

export default Index;