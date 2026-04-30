import React from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, Card, ProfilePicture } from '../components';
import { useAuth, useLeague, useMatches } from '../hooks';
import {
  subscribeToAllPredictions,
  subscribeToLeaderboard,
  type AllPredictions,
  type UserWithId,
} from '../services';
import { buildStandingRows, type StandingRow } from '../utils';

const PAGE_SIZE = 20;

const statusLabel = {
  exact: 'Exacto',
  correct: 'Resultado',
  wrong: '0 pts',
  pending: 'Pendiente',
} as const;

const statusClass = {
  exact: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
  correct: 'border-lime-400/40 bg-lime-500/15 text-lime-100',
  wrong: 'border-red-400/40 bg-red-500/15 text-red-100',
  pending: 'border-white/15 bg-white/10 text-white/70',
} as const;

const pointsText = (points: number) => `${points > 0 ? '+' : ''}${points}`;

const PlayerCell = ({ row }: { row: StandingRow }) => (
  <div className="flex min-w-0 items-center gap-3">
    <ProfilePicture
      src={row.photoURL}
      name={row.displayName}
      size="sm"
      className="shrink-0"
    />
    <div className="min-w-0">
      <p className="truncate font-semibold text-white">{row.displayName}</p>
      <p className="truncate text-xs text-white/45">@{row.userName}</p>
    </div>
  </div>
);

const SummaryBox = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="rounded-lg border border-white/10 bg-black/35 px-4 py-3">
    <p className="text-[10px] uppercase tracking-wider text-white/45">
      {label}
    </p>
    <p className="mt-1 text-2xl font-black text-white">{value}</p>
  </div>
);

const DetailTable = ({ row }: { row: StandingRow }) => (
  <div className="rounded-lg border border-white/10 bg-black/35 p-4">
    <p className="mb-3 text-sm font-semibold text-white/70">
      Detalle de puntos de {row.displayName}
    </p>
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/45">
            <th className="w-[260px] py-2 pr-3 font-medium">Partido</th>
            <th className="w-24 px-3 py-2 font-medium">Real</th>
            <th className="w-28 px-3 py-2 font-medium">
              Pronostico
            </th>
            <th className="w-32 px-3 py-2 font-medium">
              Tipo
            </th>
            <th className="w-20 py-2 pl-2 text-right font-medium">Puntos</th>
          </tr>
        </thead>
        <tbody>
          {row.details.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-5 text-center text-white/55">
                Todavia no tiene pronosticos con partidos finalizados.
              </td>
            </tr>
          ) : (
            row.details.map((detail) => (
              <tr key={detail.matchId} className="border-b border-white/5">
                <td className="truncate py-3 pr-3 text-white">
                  {detail.label}
                </td>
                <td className="px-3 py-3 text-white/70">{detail.realScore}</td>
                <td className="px-3 py-3 text-white/70">
                  {detail.predictionScore}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold ${statusClass[detail.status]}`}
                  >
                    {statusLabel[detail.status]}
                  </span>
                </td>
                <td className="py-3 pl-2 text-right font-bold text-white">
                  {pointsText(detail.points)} pts
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const DetailModal = ({
  row,
  onClose,
}: {
  row: StandingRow | null;
  onClose: () => void;
}) => {
  React.useEffect(() => {
    if (!row) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [row, onClose]);

  if (!row) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[85dvh] w-full max-w-4xl overflow-y-auto rounded-lg border border-white/15 bg-black/90 p-4 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-white/45">
              Detalle de puntos
            </p>
            <div className="mt-2">
              <PlayerCell row={row} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15"
          >
            Cerrar
          </button>
        </div>
        <DetailTable row={row} />
      </div>
    </div>
  );
};

export const Standings = () => {
  const { user } = useAuth();
  const { matches, loading: matchesLoading } = useMatches();
  const { selectedLeague, leagueMemberIds } = useLeague();
  const [users, setUsers] = React.useState<UserWithId[]>([]);
  const [predictions, setPredictions] = React.useState<AllPredictions>({});
  const [query, setQuery] = React.useState('');
  const [detailUserId, setDetailUserId] = React.useState<string | null>(
    null
  );
  const [page, setPage] = React.useState(1);
  const [loadingUsers, setLoadingUsers] = React.useState(true);
  const [loadingPredictions, setLoadingPredictions] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((data) => {
      setUsers(data);
      setLoadingUsers(false);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const unsubscribe = subscribeToAllPredictions((data) => {
      setPredictions(data);
      setLoadingPredictions(false);
    });
    return () => unsubscribe();
  }, []);

  const rows = React.useMemo(() => {
    if (!matches) return [];

    const visibleUsers =
      selectedLeague && leagueMemberIds.length > 0
        ? users.filter((item) => leagueMemberIds.includes(item.id))
        : users;

    return buildStandingRows(visibleUsers, matches, predictions);
  }, [users, matches, predictions, selectedLeague, leagueMemberIds]);

  const filteredRows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return rows;

    return rows.filter(
      (row) =>
        row.displayName.toLowerCase().includes(normalizedQuery) ||
        row.userName.toLowerCase().includes(normalizedQuery)
    );
  }, [rows, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const visibleRows = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const currentUserRow = rows.find((row) => row.id === user?.uid) ?? null;
  const loading = loadingUsers || loadingPredictions || matchesLoading;

  React.useEffect(() => {
    setPage(1);
  }, [query, selectedLeague?.id]);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const detailRow = rows.find((row) => row.id === detailUserId) ?? null;

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-7xl min-w-0 px-3 py-5 sm:px-4 md:px-6 md:py-8">
        <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_320px] lg:items-end">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-white/45 sm:text-sm">
              Tabla de posiciones
            </p>
            <h1 className="mt-1 text-2xl font-black text-white sm:text-4xl">
              Posiciones generales
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/65 sm:text-base">
              Tabla ordenada por puntos. En caso de empate se ordena por
              marcadores exactos, resultados correctos y nombre.
            </p>
          </div>

          <div className="min-w-0">
            <label className="mb-2 block text-xs uppercase tracking-wider text-white/50">
              Buscar participante
            </label>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre o usuario"
              className="w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-white/45"
            />
          </div>
        </div>

        {currentUserRow && (
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <SummaryBox
              label="Tu posicion"
              value={`#${currentUserRow.position}`}
            />
            <SummaryBox label="Tus puntos" value={currentUserRow.score} />
            <SummaryBox label="Exactos" value={currentUserRow.exactCount} />
          </div>
        )}

        <Card className="w-full min-w-0 overflow-hidden after:hidden">
          <div className="flex flex-col gap-2 border-b border-white/10 bg-black/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-white">Tabla</p>
            <p className="text-xs text-white/50">
              {filteredRows.length} de {rows.length} participantes - 20 por
              pagina
            </p>
          </div>

          {loading ? (
            <div className="p-6 text-center text-white/60">Cargando tabla...</div>
          ) : filteredRows.length === 0 ? (
            <div className="p-6 text-center text-white/60">
              No encontre participantes con esa busqueda.
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[760px] table-fixed border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-white/50">
                    <th className="w-16 px-3 py-3 font-medium md:w-20 md:px-4">
                      Pos
                    </th>
                    <th className="w-[230px] px-3 py-3 font-medium md:px-4">
                      Participante
                    </th>
                    <th className="w-24 px-3 py-3 text-right font-medium md:px-4">
                      Puntos
                    </th>
                    <th className="w-24 px-3 py-3 text-right font-medium md:px-4">
                      Exactos
                    </th>
                    <th className="w-28 px-3 py-3 text-right font-medium md:px-4">
                      Resultados
                    </th>
                    <th className="w-20 px-3 py-3 text-right font-medium md:px-4">
                      Jugados
                    </th>
                    <th className="w-24 px-3 py-3 text-right font-medium md:px-4">
                      Detalle
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => {
                    const isCurrentUser = row.id === user?.uid;

                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-white/10 transition-colors ${
                          isCurrentUser ? 'bg-yellow-500/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="px-3 py-3 text-xl font-black text-white/75 md:px-4 md:text-2xl">
                          #{row.position}
                        </td>
                        <td className="min-w-0 px-3 py-3 md:px-4">
                          <PlayerCell row={row} />
                        </td>
                        <td className="px-3 py-3 text-right text-xl font-black text-white md:px-4 md:text-2xl">
                          {row.score}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-white/85 md:px-4">
                          {row.exactCount}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-white/85 md:px-4">
                          {row.resultCount}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-white/85 md:px-4">
                          {row.playedPredictions}
                        </td>
                        <td className="px-3 py-3 text-right md:px-4">
                          <button
                            type="button"
                            onClick={() => setDetailUserId(row.id)}
                            className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {!loading && filteredRows.length > PAGE_SIZE && (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-white/10 bg-black/35 p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/60">
              Pagina {page} de {totalPages}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Primera
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page === totalPages}
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Ultima
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 text-center text-sm text-white/50">
          El ranking visual queda en{' '}
          <Link to="/leaderboard" className="text-white underline">
            Podio
          </Link>
          .
        </div>
      </div>
      <DetailModal row={detailRow} onClose={() => setDetailUserId(null)} />
    </AppLayout>
  );
};
