import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AddCardFormProps {
  onAdd: (question: string, answer: string) => void;
}

export const AddCardForm = ({
  onAdd
}: AddCardFormProps) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("Please fill in both fields");
      return;
    }
    onAdd(question, answer);
    setQuestion("");
    setAnswer("");
    toast.success("Flashcard added successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <label htmlFor="question" className="text-sm font-medium text-gray-700 block">
          Question
        </label>
        <Input 
       
          id="question" 
          value={question} 
          onChange={e => setQuestion(e.target.value)} 
          placeholder="Enter your question" 
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="answer" className="text-sm font-medium text-gray-700 block">
          Answer
        </label>
        <Textarea 
          id="answer" 
          value={answer} 
          onChange={e => setAnswer(e.target.value)} 
          placeholder="Enter the answer" 
          className="w-full min-h-[100px] outline-none  outline-hidden border-none text-base"
        />
      </div>
      <Button type="submit" className="w-full">
        Add Flashcard
      </Button>
    </form>
  );
};