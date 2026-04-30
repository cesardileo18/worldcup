import { Chip } from '../ui/Chip';
import { useMatches } from '../../hooks';
import { isMockModeEnabled } from '../../utils';

type ViewMode = 'day' | 'group';

type MatchesHeaderProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  title?: string;
  showMobileMascot?: boolean;
};

export const MatchesHeader = ({
  viewMode,
  onViewModeChange,
  title = 'Partidos',
  showMobileMascot = false,
}: MatchesHeaderProps) => {
  const { revealMockResults, resetMockResults, mockResultsVisible } =
    useMatches();
  const mockMode = isMockModeEnabled();

  return (
    <div className="mb-6">
      <div
        className={`flex gap-3 ${
          showMobileMascot
            ? 'items-start justify-between sm:items-center'
            : 'flex-col sm:flex-row sm:items-center sm:justify-between'
        }`}
      >
        <div className="flex min-w-0 flex-col gap-3">
          <h2 className="text-3xl font-bold leading-none">{title}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {mockMode && (
              <button
                type="button"
                onClick={
                  mockResultsVisible ? resetMockResults : revealMockResults
                }
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  backgroundColor: 'var(--brand-accent)',
                  color: 'var(--brand-ink)',
                }}
              >
                {mockResultsVisible ? 'Ocultar resultados' : 'Buscar resultados'}
              </button>
            )}
            <Chip
              active={viewMode === 'day'}
              onClick={() => onViewModeChange('day')}
            >
              Por dia
            </Chip>
            <Chip
              active={viewMode === 'group'}
              onClick={() => onViewModeChange('group')}
            >
              Por grupo
            </Chip>
          </div>
        </div>
        {showMobileMascot && (
          <img
            src="/iqfutbol.png"
            alt=""
            className="mt-0.5 h-24 w-24 shrink-0 object-contain md:hidden"
          />
        )}
      </div>
    </div>
  );
};
