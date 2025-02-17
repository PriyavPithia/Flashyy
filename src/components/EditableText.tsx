import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface EditableTextProps {
  value: string
  onSave: (newValue: string) => void
  className?: string
}

export function EditableText({ value, onSave, className = "" }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
      adjustHeight()
    }
  }, [isEditing])

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value)
    adjustHeight()
  }

  const handleSave = () => {
    if (editValue.trim() && editValue.trim() !== value) {
      onSave(editValue.trim())
    }
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={editValue}
        onChange={handleChange}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSave()
          }
          if (e.key === 'Escape') {
            setIsEditing(false)
            setEditValue(value)
          }
        }}
        className={cn(
          "w-full bg-transparent border-none p-0 no-focus-ring auto-grow",
          "text-inherit font-inherit  resize-none",
          className
        )}
        rows={1}
      />
    )
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer hover:bg-black/5 px-2 py-1 rounded transition-colors",
        "whitespace-pre-wrap break-words text-sm leading-5",
        className
      )}
    >
      {value}
    </div>
  )
} 