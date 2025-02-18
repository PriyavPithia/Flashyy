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
import { Palette, Trash2, Play, Plus, ScrollText, Files, Settings, LogOut, ChevronDown, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { EditableText } from "@/components/EditableText";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GroupCarousel } from "@/components/GroupCarousel";
import { Folder } from "lucide-react";
import { PracticeSetup } from "@/components/PracticeSetup";
import logo from "../../public/assets/flashyylogo.png";
import { cn } from "@/lib/utils";
import { FlashcardEditor } from "@/components/FlashcardEditor";
import { getDocument } from 'pdfjs-dist';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractTextFromPDF, parseFlashcards } from '@/utils/pdf';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const Index = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(true);
  const [addMode, setAddMode] = useState<"single" | "bulk" | "file">("single");
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
  const [expandedCardIds, setExpandedCardIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState<string | undefined>(undefined);

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
        .order('created_at', { ascending: false });

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
        .order('created_at', { ascending: false });

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
      // Reset scroll position before showing practice setup
      window.scrollTo(0, 0);
      setShowPracticeSetup(true);
    }
  };

  const startPractice = (selectedCards: Card[], selectedGroups: string[]) => {
    // Reset scroll position when starting practice
    window.scrollTo(0, 0);
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
      // Find the group to update
      const groupToUpdate = groups.find(g => g.id === groupId);
      if (!groupToUpdate) return;

      // Immediately update the UI (optimistic update)
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, ...updates }
          : group
      ));

      // Make the API call
      const { error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId)
        .eq('user_id', user?.id);

      if (error) {
        // If there's an error, revert the changes
        setGroups(prev => prev.map(group => 
          group.id === groupId 
            ? groupToUpdate
            : group
        ));
        throw error;
      }

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

  const handleToggleExpand = (cardId: string) => {
    setExpandedCardIds(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [cardId]  // Replace with [cardId] to allow only one card expanded at a time
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsProcessing(true);
      
      // Step 1: Parse PDF
      setProcessingStatus('Parsing PDF...');
      console.log('Starting PDF extraction for file:', file.name);
      const text = await extractTextFromPDF(file);
      
      // Calculate approximate word count and pages
      const wordCount = text.split(/\s+/).length;
      const pageCount = (text.match(/Page \d+:/g) || []).length;
      console.log('Document stats:', { wordCount, pageCount });
      
      // Calculate minimum number of flashcards
      const minCards = Math.max(
        wordCount < 1000 ? 20 : 60,
        pageCount * 8
      );
      
      // Step 2: Send to Gemini
      setProcessingStatus('Generating flashcards with AI...');
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `You are a University Professor creating a comprehensive set of flashcards for your students. Your task is to create detailed flashcards that thoroughly cover every concept in the document.

IMPORTANT: You must create at least ${minCards} flashcards from this text. This is a strict minimum requirement.

Format each flashcard exactly as shown:
Q: [question here]
A: [answer here]

Requirements:
- Create AT LEAST ${minCards} flashcards (this is mandatory)
- Create 5-6 flashcards for each major concept or section
- Do not use any bold text or markdown formatting
- Start each question with "Q: " and each answer with "A: "
- Separate each Q&A pair with a newline
- Questions and answers should be detailed (at least 20 words each)
- Break down complex topics into multiple related flashcards
- Include both factual and analytical questions
- For each main point, create flashcards that cover:
  * Core concept explanation
  * Supporting details and examples
  * Practical applications
  * Relationships with other concepts
  * Critical analysis questions
  * Problem-solving scenarios

Example of breaking down a concept into multiple cards:
Hardware Components
Flashcard 1
Q: Why is the control unit of the CPU essential in a computer system, and how does it interact with other components?
A: The control unit interprets software instructions and directs activities of other components, ensuring synchronized execution of tasks. It communicates through the bus system, managing data flow between input, memory, and processing units.

Flashcard 2
Q: How does cache memory improve processing speed, and why is it different from primary memory?
A: Cache memory provides high-speed, temporary storage close to the processor, reducing the time needed to access frequently used instructions. Unlike primary memory, cache operates faster but has significantly lower capacity.

Flashcard 3
Q: Explain how parallel computing differs from multiprocessing. In what scenarios would one be preferred over the other?
A: Parallel computing executes the same task on multiple processors simultaneously, ideal for large-scale data processing. Multiprocessing, in contrast, runs different tasks on multiple processors, which is better suited for multitasking environments.

Flashcard 4
Q: What role do coprocessors play in specialized computing tasks, and how do they enhance overall performance?
A: Coprocessors handle specific types of instructions (e.g., mathematical calculations, graphics rendering) while the CPU executes other tasks, thus optimizing efficiency and reducing processing bottlenecks.

Flashcard 5
Q: Discuss the implications of Moores Law on long-term hardware development. What are the physical and economic limitations of this trend?
A: While Moores Law suggests doubling processing power every two years, physical constraints such as heat dissipation and atomic-scale transistor limits, along with increasing production costs, challenge its continued applicability.

Software Components
Flashcard 6
Q: Why is hardware independence an important function of an operating system, and how does it impact software development?
A: Hardware independence allows software to run on different systems without modification, simplifying development and enhancing compatibility across diverse computing environments.

Flashcard 7
Q: What is middleware, and why is it crucial in modern enterprise computing?
A: Middleware bridges different software applications, enabling communication and data exchange between systems. It is essential in distributed computing environments like cloud services and enterprise networks.

Flashcard 8
Q: Compare and contrast the role of a compiler and an interpreter in program execution. What are the advantages and disadvantages of each?
A: A compiler translates the entire source code before execution, making programs run faster but requiring compilation time. An interpreter executes code line by line, allowing for real-time debugging but leading to slower execution speeds.

Flashcard 9
Q: In what scenarios would a company benefit from using Software as a Service (SaaS) rather than traditional software deployment?
A: SaaS reduces upfront costs, provides scalability, and simplifies maintenance. It is ideal for businesses needing remote access, frequent updates, and lower IT infrastructure investment. However, it relies on internet connectivity and raises security concerns.

Flashcard 10
Q: How does the concept of a "software sphere of influence" shape the design and implementation of different types of software?
A: The sphere of influence (personal, workgroup, or enterprise) determines the software's functionality, scalability, and integration needs, guiding its architecture and user experience design.

Remember: You MUST create at least ${minCards} flashcards. Here's the text to convert into flashcards:

${text}`;

      console.log('Sending prompt to Gemini:', prompt);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const flashcardsText = response.text();
      console.log('Received Gemini response:', flashcardsText);
      
      // Step 3: Parse AI response into flashcards
      setProcessingStatus('Processing flashcards...');
      const flashcards = parseFlashcards(flashcardsText);
      console.log('Parsed flashcards:', flashcards);
      
      // Step 4: Bulk add cards
      if (flashcards.length > 0) {
        await handleBulkAdd(flashcards);
        toast.success(`${flashcards.length} cards added successfully!`);
      } else {
        toast.error('No valid flashcards were generated');
      }
      
      // Reset the file input after successful processing
      if (e.target) {
        e.target.value = '';
      }
      
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file');
      setIsProcessing(false);
      // Also reset the file input on error
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleDeleteAllCards = async (groupId?: string) => {
    setDeleteGroupId(groupId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteGroupId) {
        // Delete cards for a specific group
        const { error } = await supabase
          .from('cards')
          .delete()
          .eq('user_id', user?.id)
          .eq('group_id', deleteGroupId);

        if (error) throw error;
        
        // Update local state for group-specific deletion
        setCards(prev => prev.filter(card => card.group_id !== deleteGroupId));
        toast.success('All flashcards in this group deleted successfully!');
      } else {
        // Delete all cards for the user
        const { error } = await supabase
          .from('cards')
          .delete()
          .eq('user_id', user?.id)
          .eq('group_id', selectedGroupId);

        if (error) throw error;
        
        // Update local state to remove only cards from the current group
        setCards(prev => prev.filter(card => card.group_id !== selectedGroupId));
        toast.success('All flashcards in this group deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting cards:', error);
      toast.error('Failed to delete cards');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  // Add this useEffect to handle history and prevent authentication loop
  useEffect(() => {
    if (!isAdding) {
      // Push a new state to history when entering practice mode
      window.history.pushState({ practice: true }, '');
    }

    // Handle back button
    const handlePopState = (event: PopStateEvent) => {
      if (!event.state?.practice && !isAdding) {
        // If going back from practice mode, return to add cards
        setIsAdding(true);
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdding]);

  // Add this useEffect to handle body scroll locking
  useEffect(() => {
    if (showPracticeSetup) {
      // Lock scrolling when practice setup is shown
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scrolling when practice setup is closed
      document.body.style.overflow = 'auto';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPracticeSetup]);

  return <div className="flex ">
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
            {isAdding ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Practice
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Cards
              </>
            )}
          </Button>

          {!isAdding && (
            <Button 
              variant="outline"
              onClick={() => setShowPracticeSetup(true)}
              className="w-full justify-start"
            >
              <Settings className="mr-2 h-4 w-4" />
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
                <Plus className="mr-2 h-4 w-4" />
                  Single Card
                </Button>
              <Button 
                variant={addMode === "bulk" ? "default" : "outline"} 
                onClick={() => setAddMode("bulk")} 
                className="w-full justify-start"
              >
                <Files className="mr-2 h-4 w-4" />
                  Bulk Add
                </Button>
              <Button 
                variant={addMode === "file" ? "default" : "outline"} 
                onClick={() => setAddMode("file")} 
                className="w-full justify-start"
              >
                <Upload className="mr-2 h-4 w-4" />
                  Upload File
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
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className={cn(
      "flex-1",
      !isAdding && isMobile ? "overflow-hidden" : "overflow-auto hide-desktop-scrollbar"
    )}>
      <div className={cn(
        "h-full",
        !isAdding ? "p-0" : "px-[20px] pt-[20px] pb-[15px]"
      )}>
        <div className={cn(
          "h-full",
          !isAdding ? "max-w-none" : "max-w-4xl mx-auto"
        )}>
          <div className="">
            
            
            {/* Mobile-only buttons */}
            <div className="space-x-2 md:space-x-4 flex justify-center md:hidden">
              
            </div>
          </div>

          {isAdding && (
            <div className="flex flex-col min-h-screen">
              {/* Logo section */}
              <div className="flex-none text-center ">
                <img 
                  src={logo} 
                  alt="Flashyy" 
                  className="h-[45px] w-auto mx-auto mb-1" 
                />
                <p className="text-black/70 text-sm">
                  Add new flashcards to your collection
                </p>
              </div>

              {/* Main content - Adjusted overflow handling */}
              <div className="flex-1 overflow-x-hidden">
                {/* Mobile buttons */}
                <div className="md:hidden mt-6 mb-7">
                  <div className=" justify-center flex  mx-auto">
                    <button
                      onClick={toggleMode}
                      className="flex mt-3 flex-col py-5 w-[135px] items-center justify-center p-4 rounded-xl bg-black text-white shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">Start Practice</span>
                    </button>

                    
                  </div>
                </div>

                {/* Groups carousel */}
                <div className="mb-6">
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

                {/* Cards grid - Adjusted container */}
                <div id="add-card-section" className="md:grid md:grid-cols-2 gap-6  md:pb-6">
            <div className="space-y-6">
                    {!selectedGroupId ? (
                      <div className="text-center mt-[-15px] py-8 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-medium text-black/90 mb-2">
                          Select a Group
                        </h3>
                        <p className="text-sm text-black/70">
                          Click on a group above to add cards to it
                        </p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg md:text-xl italic font-semibold text-left mt-[-15px] md:mt-4 mb-1">
                          Adding cards to: {groups.find(g => g.id === selectedGroupId)?.name}
                        </h3>
                        <div className="flex md:justify-start justify-between gap-2  flex-wrap">
                          <button
                            onClick={() => setAddMode("single")}
                            className={cn(
                              "px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center",
                              addMode === "single" 
                                ? "bg-black text-white" 
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Single
                          </button>
                          <button
                            onClick={() => setAddMode("bulk")}
                            className={cn(
                              "px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center",
                              addMode === "bulk" 
                                ? "bg-black text-white" 
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            <Files className="mr-2 h-4 w-4" />
                            Bulk
                          </button>
                          <button
                            onClick={() => setAddMode("file")}
                            className={cn(
                              "px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center",
                              addMode === "file" 
                                ? "bg-black text-white" 
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            File Upload
                          </button>
                        </div>
                        <div>
                          {addMode === "single" ? (
                            <AddCardForm onAdd={handleAddCard} />
                          ) : addMode === "bulk" ? (
                            <BulkAddForm onAdd={handleBulkAdd} />
                          ) : (
                            <div className="space-y-4 w-full max-w-md">
                              <h2 className="text-sm text-gray-700 font-medium ">We only support .PDF files</h2>
                              <div className={cn(
                                "border-2 border-dashed border-gray-200 rounded-lg p-8 text-center",
                                "hover:border-gray-300 transition-all",
                                isProcessing && "opacity-50 pointer-events-none"
                              )}>
                                <input
                                  type="file"
                                  id="file-upload"
                                  className="hidden"
                                  accept=".pdf"
                                  onChange={handleFileUpload}
                                  disabled={isProcessing}
                                />
                                <label 
                                  htmlFor="file-upload"
                                  className="cursor-pointer flex flex-col items-center"
                                >
                                  {isProcessing ? (
                                    <>
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2" />
                                      <p className="text-sm font-medium text-gray-900 mb-1">
                                        {processingStatus}
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                      <p className="text-sm font-medium text-gray-900 mb-1">
                                        Click to upload or drag and drop
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        PDF files only (max 10MB)
                                      </p>
                                    </>
                                  )}
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                
                  {/* Left column */}
                  

                  {/* Right column */}
                  <div className="space-y-4">
                    <div className="flex justify-between mt-7 md:mt-0 mb-[-20px] items-center">
                      <h2 className="text-lg italic md:text-xl font-semibold text-black/90 text-center md:text-left mt-4 mb-6">
                        Your Flashcards
                      </h2>
                      <div className="flex items-center gap-2 overflow-auto">
                        <h2 className="text-xs md:text-base font-medium text-black/70 text-center md:text-left mt-4 mb-6">
                          {selectedGroupId 
                            ? `${groups.find(g => g.id === selectedGroupId)?.name} (${
                                cards.filter(card => card.group_id === selectedGroupId).length
                              })`
                            : `All Flashcards (${cards.length})`
                          }
                        </h2>
                        {(selectedGroupId || cards.length > 0) && (
                          <button
                            onClick={() => handleDeleteAllCards(selectedGroupId)}
                            className="mt-4 mb-6 p-1.5 rounded-full  transition-colors group"
                            title="Delete all flashcards"
                          >
                            <Trash2 className="h-4 w-4 text-black/90 opacity-60 group-hover:opacity-100" />
                          </button>
                        )}
                      </div>
                          </div>
                    
                    {/* Flashcards container - Using Carousel for mobile, vertical scroll for desktop */}
                    <div className="w-full">
                      {/* Mobile Carousel */}
                      <div className="md:hidden">
                        <Carousel
                          opts={{
                            align: "start",
                            loop: false,
                            containScroll: "trimSnaps"
                          }}
                          className="w-full relative"
                        >
                          <CarouselContent>
                            {(selectedGroupId 
                              ? cards.filter(card => card.group_id === selectedGroupId)
                              : cards
                            )
                            .sort((a, b) => {
                              const dateA = new Date(a.created_at || 0);
                              const dateB = new Date(b.created_at || 0);
                              return dateB.getTime() - dateA.getTime();
                            })
                            .map((card) => (
                              <CarouselItem 
                                key={card.id} 
                                className="basis-[88%] mb-[40px]  pl-4 pr-4 first:pl-4 last:pr-4"
                              >
                                <FlashcardEditor
                                  card={card}
                                  groups={groups}
                                  onUpdateCard={updateCard}
                                  onUpdateGroup={updateGroup}
                                  onDeleteCard={deleteCard}
                                />
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                        </Carousel>
                      </div>

                      {/* Desktop Vertical Scroll */}
                      <div className="hidden md:block h-[500px] overflow-y-auto">
                        <div className="space-y-4 pr-2">
                          {(selectedGroupId 
                            ? cards.filter(card => card.group_id === selectedGroupId)
                            : cards
                          )
                          .sort((a, b) => {
                            const dateA = new Date(a.created_at || 0);
                            const dateB = new Date(b.created_at || 0);
                            return dateB.getTime() - dateA.getTime();
                          })
                          .map((card) => (
                            <FlashcardEditor
                              key={card.id}
                              card={card}
                              groups={groups}
                              onUpdateCard={updateCard}
                              onUpdateGroup={updateGroup}
                              onDeleteCard={deleteCard}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isAdding && (
            <div className="flex flex-col min-h-[100dvh] px-4 py-2 justify-between touch-none relative">
              {/* Lighter gradient background - Slightly less visible */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  background: `
                    linear-gradient(
                      45deg,
                      #e9d5ff 0%,
                      #dbeafe 25%,
                      #ffedd5 50%,
                      #dcfce7 75%,
                      #e9d5ff 100%
                    )
                  `,
                  backgroundSize: '400% 400%',
                }}
              />

              {/* Header */}
              <div className="text-center py-1 flex-none relative">
                <img 
                  src={logo} 
                  alt="Flashyy" 
                  className="h-[45px] w-auto mx-auto mb-1" 
                />
                <p className="text-xs mb-5 md:text-sm text-black/70">
                  Tap to see Answer • Swipe to navigate
                </p>
                      </div>

              {/* Flashcard Container */}
              <div className="flex-1 flex items-center z-10 justify-center -mt-4 md:mt-0">
                {practiceCards.length > 0 ? (
                  currentCardIndex >= practiceCards.length ? (
                    // Completion screen
                    <div className="text-center space-y-8 px-4">
                      <div className="space-y-2 mt-[-70px] md:mt-[-200px]">
                        <h2 className="text-3xl italic font-bold text-gray-900">
                        ✨ Perfect!✨
                        </h2>
                        <p className="md:text-md text-sm text-black/70">
                          You have completed your practice.
                        </p>
                      </div>
                      
                      {/* Completion screen buttons */}
                      <div className="flex-row grid grid-cols-2 md:grid-cols-3 gap-4 justify-center items-center">
                        {/* Go Again button */}
                        <button
                          onClick={() => {
                            setPracticeCards(shuffleCards([...practiceCards]));
                            setCurrentCardIndex(0);
                          }}
                          className="flex flex-col py-5 w-[135px] items-center justify-center p-4 rounded-xl bg-black text-white shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                          <span className="text-sm font-medium text-white">Go Again</span>
                        </button>

                        {/* Practice Setup button - Now black */}
                        <button
                          onClick={() => setShowPracticeSetup(true)}
                          className="flex flex-col py-5 w-[135px] items-center justify-center p-4 rounded-xl bg-black text-white shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                            <Settings className="h-6 w-6 text-white" />
                          </div>
                          <span className="text-sm font-medium text-white">Practice Setup</span>
                        </button>

                        {/* Add Cards button - Now black */}
                        <button
                          onClick={() => setIsAdding(true)}
                          className="flex flex-col py-5 w-[135px] items-center justify-center p-4 rounded-xl bg-black text-white shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                            <Plus className="h-6 w-6 text-white" />
                          </div>
                          <span className="text-sm font-medium text-white">Add Cards</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Flashcard 
                      key={practiceCards[currentCardIndex].id} 
                      question={practiceCards[currentCardIndex].question} 
                      answer={practiceCards[currentCardIndex].answer} 
                      onSwipe={handleSwipe} 
                      groupName={groups.find(g => g.id === practiceCards[currentCardIndex].group_id)?.name || ""} 
                      groupColor={groups.find(g => g.id === practiceCards[currentCardIndex].group_id)?.color || GROUP_COLORS.softGray}
                      direction={swipeDirection}
                    />
                  )
                ) : (
                  <div className="text-center text-gray-500">
                    No flashcards available. Add some first!
                  </div>
                )}
              </div>

              {/* Footer */}
              {cards.length > 0 && (
                <div className="text-center py-1 flex-none">
                  <p className="text-xs mt-[-30px] md:text-sm text-black/70">
                    Flashcard {currentCardIndex + 1} of {practiceCards.length}
                  </p>
                  <p className="text-xs text-black/70 mt-0.5">
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
      showPracticeSetup={!isAdding} children={""}    />

    {showPracticeSetup && (
      <div className="fixed inset-0 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 overflow-hidden">
        <PracticeSetup
          groups={groups}
          cards={cards}
          onStart={startPractice}
          onCancel={() => {
            setShowPracticeSetup(false);
            document.body.style.overflow = 'auto';
          }}
        />
      </div>
    )}

    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {deleteGroupId ? 'the group and all its' : 'all'} flashcards. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={confirmDelete}
            className="bg-black hover:bg-black/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>;
};

export default Index;