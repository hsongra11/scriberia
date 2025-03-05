'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import type { Attachment, } from 'ai';
import type { Note, Template } from '@/lib/db/schema';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import type { TemplateCategory } from '@/lib/templates/default-templates';
import { MultimodalInput } from '@/components/multimodal-input';
import { Messages } from '@/components/messages';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteChatProps {
  note?: Note;
  template?: Template;
  onUpdate?: (content: string) => void;
  className?: string;
}

export function NoteChat({ note, template, onUpdate, className }: NoteChatProps) {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const {
    messages,
    input,
    handleSubmit,
    setInput,
    isLoading,
    setMessages,
    append,
    reload,
    stop,
  } = useChat({
    api: '/api/notes/chat',
    id: note?.id || 'new-note',
    body: {
      noteId: note?.id,
      templateId: template?.id,
      selectedChatModel: DEFAULT_CHAT_MODEL,
    },
    onResponse: (response) => {
      // Optional: Handle any response metadata
    },
    onFinish: (message) => {
      // Update the note content if onUpdate is provided
      if (onUpdate && message.content) {
        onUpdate(message.content);
      }
    },
  });

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
    
    // If opening the chat and no messages yet, add a context message
    if (!isChatVisible && messages.length === 0) {
      const templateType = template?.category as TemplateCategory || 'custom';
      const initialContext = getInitialContext(templateType, note?.title || 'Untitled');
      
      append({
        id: 'system-1',
        role: 'system',
        content: initialContext,
      });
    }
  };

  // Get initial context message based on template type
  const getInitialContext = (templateType: TemplateCategory, title: string) => {
    switch (templateType) {
      case 'journal':
        return `I'm working on a journal entry titled "${title}". How can you help me with this entry?`;
      case 'to-do':
        return `I'm working on a to-do list titled "${title}". Can you help me organize my tasks?`;
      case 'brain-dump':
        return `I'm doing a brain dump titled "${title}". Can you help me organize my thoughts?`;
      case 'mood-tracking':
        return `I'm tracking my mood in a note titled "${title}". Can you help me reflect on my emotional patterns?`;
      default:
        return `I'm working on a note titled "${title}". How can you help me with this note?`;
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Chat toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 z-10 rounded-full size-12 shadow-md"
        onClick={toggleChat}
      >
        {isChatVisible ? (
          <X className="size-5" />
        ) : (
          <MessageSquare className="size-5" />
        )}
      </Button>

      {/* Chat panel */}
      {isChatVisible && (
        <div className="fixed bottom-[72px] right-4 z-10 w-[350px] h-[500px] bg-background border rounded-md shadow-lg flex flex-col">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-medium">Note Assistant</h3>
            <Button variant="ghost" size="icon" onClick={toggleChat}>
              <X className="size-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-3">
              <Messages
                chatId={note?.id || 'new-note'}
                messages={messages}
                isLoading={isLoading}
                votes={[]}
                setMessages={setMessages}
                reload={reload}
                isReadonly={false}
                isArtifactVisible={false}
              />
            </div>
            
            <div className="p-3 border-t">
              <form onSubmit={handleSubmit}>
                <MultimodalInput
                  chatId={note?.id || 'new-note'}
                  input={input}
                  setInput={setInput}
                  isLoading={isLoading}
                  stop={stop}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  messages={messages}
                  setMessages={setMessages}
                  append={append}
                  handleSubmit={handleSubmit}
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 