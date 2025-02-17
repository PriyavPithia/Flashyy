import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
interface BulkAddFormProps {
  onAdd: (cards: Array<{
    question: string;
    answer: string;
  }>) => void;
}
export const BulkAddForm = ({
  onAdd
}: BulkAddFormProps) => {
  const [text, setText] = useState("");
  const parseText = (text: string) => {
    const cards: Array<{
      question: string;
      answer: string;
    }> = [];
    const sections = text.split(/\n\s*\n/); // Split by empty lines

    sections.forEach(section => {
      const qMatch = section.match(/Q:\s*(.+)(\n|$)/);
      const aMatch = section.match(/A:\s*(.+)(\n|$)/);
      if (qMatch && aMatch) {
        cards.push({
          question: qMatch[1].trim(),
          answer: aMatch[1].trim()
        });
      }
    });
    return cards;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cards = parseText(text);
    if (cards.length === 0) {
      toast.error("No valid Q&A pairs found. Please use the format 'Q: question' followed by 'A: answer'");
      return;
    }
    onAdd(cards);
    setText("");
    toast.success(`Added ${cards.length} flashcards successfully!`);
  };
  return <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <label htmlFor="bulkText" className="text-sm font-medium text-gray-700 block">
          Paste your questions and answers
        </label>
        <div className="text-xs text-gray-500 mb-2">
          Format each pair as:
          <pre className="mt-1 bg-gray-50 p-2 rounded">
            Q: Your question
            A: Your answer
          </pre>
          Separate pairs with empty lines
        </div>
        <Textarea id="bulkText" value={text} onChange={e => setText(e.target.value)} placeholder="Q: What is React?\nA: A JavaScript library for building user interfaces.\n\nQ: What is JSX?\nA: A syntax extension for JavaScript..." className="w-full min-h-[200px] font-mono text-base" />
      </div>
      <Button type="submit" className="w-full">
        Add Flashcards
      </Button>
    </form>;
};