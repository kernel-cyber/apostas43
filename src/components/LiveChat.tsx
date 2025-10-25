import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LiveChatProps {
  matchId: string;
  userId: string;
  username: string;
}

export const LiveChat = ({ matchId, userId, username }: LiveChatProps) => {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    }
  });

  const sendMessage = useMutation({
    mutationFn: async (text: string) => {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          match_id: matchId,
          user_id: userId,
          username,
          message: text
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', matchId] });
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `match_id=eq.${matchId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', matchId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, queryClient]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage.mutate(message.trim());
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-bold text-lg">💬 Chat Ao Vivo</h3>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-lg ${
                msg.user_id === userId ? 'bg-primary/20 ml-auto' : 'bg-muted'
              } max-w-[80%] ${msg.user_id === userId ? 'text-right' : ''}`}
            >
              <p className="font-semibold text-xs text-muted-foreground">
                {msg.username}
              </p>
              <p className="text-sm">{msg.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(msg.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </p>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          maxLength={200}
        />
        <Button type="submit" size="icon" disabled={!message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};
