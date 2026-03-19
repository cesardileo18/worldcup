import { Chip } from '../ui/Chip';

type ViewMode = 'day' | 'group';

type MatchesHeaderProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  title?: string;
};

export const MatchesHeader = ({
  viewMode,
  onViewModeChange,
  title = 'Partidos',
}: MatchesHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-bold leading-none">{title}</h2>
      <div className="flex items-center gap-2">
        <Chip
          active={viewMode === 'day'}
          onClick={() => onViewModeChange('day')}
        >
          Por día
        </Chip>
        <Chip
          active={viewMode === 'group'}
          onClick={() => onViewModeChange('group')}
        >
          Por grupo
        </Chip>
      </div>
    </div>
  );
};
