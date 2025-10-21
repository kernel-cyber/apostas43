/**
 * Helper functions for round and cycle management
 */

export interface RoundInfo {
  cycleLabel: string;
  fullLabel: string;
  emoji: string;
}

/**
 * Get round label based on cycle_position and round_number
 * @param cycle_position - Position in the 4-stage cycle (1-4)
 * @param round_number - Sequential round number
 * @returns Formatted round label
 */
export function getRoundLabel(cycle_position: number | null, round_number: number): RoundInfo {
  const cycleNames: Record<number, { label: string; emoji: string }> = {
    1: { label: '1ª Rodada Ímpar', emoji: '🔵' },
    2: { label: '1ª Rodada Par', emoji: '🟢' },
    3: { label: '2ª Rodada Ímpar', emoji: '🟣' },
    4: { label: '2ª Rodada Par', emoji: '🟠' }
  };

  if (cycle_position && cycleNames[cycle_position]) {
    const { label, emoji } = cycleNames[cycle_position];
    return {
      cycleLabel: label,
      fullLabel: `${label} (Rodada #${round_number})`,
      emoji
    };
  }

  // Fallback para rounds sem cycle_position definido
  return {
    cycleLabel: `Rodada #${round_number}`,
    fullLabel: `Rodada #${round_number}`,
    emoji: '⚪'
  };
}

/**
 * Get cycle completion status
 * @param oddCount - Number of odd rounds completed
 * @param evenCount - Number of even rounds completed
 * @returns Status message
 */
export function getCycleStatus(oddCount: number, evenCount: number): {
  message: string;
  type: 'info' | 'warning' | 'success';
  nextCyclePosition: number;
} {
  const totalCompleted = oddCount + evenCount;

  // Determinar próxima posição no ciclo
  let nextCyclePosition: number;
  if (oddCount === 0) {
    nextCyclePosition = 1; // 1ª Ímpar
  } else if (evenCount === 0) {
    nextCyclePosition = 2; // 1ª Par
  } else if (oddCount === 1) {
    nextCyclePosition = 3; // 2ª Ímpar
  } else if (evenCount === 1) {
    nextCyclePosition = 4; // 2ª Par
  } else {
    // Ciclo completo, reinicia
    nextCyclePosition = 1;
  }

  if (totalCompleted === 0) {
    return {
      message: 'ℹ️ Esta será a 1ª Rodada Ímpar do evento',
      type: 'info',
      nextCyclePosition
    };
  }

  if (totalCompleted === 4 && oddCount === 2 && evenCount === 2) {
    return {
      message: '✅ Ciclo de 4 rodadas completo! Próxima rodada iniciará um novo ciclo.',
      type: 'success',
      nextCyclePosition: 1
    };
  }

  const remaining = 4 - (totalCompleted % 4);
  if (remaining === 4) {
    return {
      message: '⚠️ Ciclo anterior completo. Iniciando novo ciclo de 4 rodadas.',
      type: 'warning',
      nextCyclePosition
    };
  }

  return {
    message: `ℹ️ Faltam ${remaining} etapa${remaining > 1 ? 's' : ''} para completar o ciclo de 4 rodadas`,
    type: 'info',
    nextCyclePosition
  };
}

/**
 * Get next suggested bracket type
 * @param lastBracketType - The last bracket type used
 * @param oddCount - Number of odd rounds
 * @param evenCount - Number of even rounds
 * @returns Suggested bracket type
 */
export function getNextBracketType(
  lastBracketType: string | null,
  oddCount: number,
  evenCount: number
): 'top20_odd' | 'top20_even' {
  // Se não há histórico, começa com ímpar
  if (oddCount === 0 && evenCount === 0) {
    return 'top20_odd';
  }

  // Alternar entre odd e even
  if (lastBracketType === 'odd' || lastBracketType === 'top20_odd') {
    return 'top20_even';
  }

  return 'top20_odd';
}
