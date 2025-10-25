import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MatchReactionsProps {
  matchId: string;
  userId: string;
}

const REACTIONS = [
  { type: 'fire', emoji: '🔥', label: 'Fogo' },
  { type: 'clap', emoji: '👏', label: 'Parabéns' },
  { type: 'shock', emoji: '😱', label: 'Chocado' },
  { type: 'muscle', emoji: '💪', label: 'Forte' },
  { type: 'heart', emoji: '❤️', label: 'Amei' },
];

export const MatchReactions = ({ matchId, userId }: MatchReactionsProps) => {
  const queryClient = useQueryClient();

  const { data: reactions = [] } = useQuery({
    queryKey: ['match-reactions', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_reactions')
        .select('*')
        .eq('match_id', matchId);
      
      if (error) throw error;
      return data || [];
    }
  });

  const userReaction = reactions.find(r => r.user_id === userId);

  const reactionCounts = REACTIONS.map(r => ({
    ...r,
    count: reactions.filter(rx => rx.reaction === r.type).length
  }));

  const toggleReaction = useMutation({
    mutationFn: async (reactionType: string) => {
      if (userReaction) {
        // Remover reação
        const { error } = await supabase
          .from('match_reactions')
          .delete()
          .eq('match_id', matchId)
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Adicionar reação
        const { error } = await supabase
          .from('match_reactions')
          .insert({
            match_id: matchId,
            user_id: userId,
            reaction: reactionType
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-reactions', matchId] });
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel(`reactions-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_reactions',
          filter: `match_id=eq.${matchId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['match-reactions', matchId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, queryClient]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {reactionCounts.map((r) => (
        <Button
          key={r.type}
          variant={userReaction?.reaction === r.type ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleReaction.mutate(r.type)}
          className="gap-1"
        >
          <span>{r.emoji}</span>
          {r.count > 0 && (
            <Badge variant="secondary" className="ml-1">
              {r.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};
