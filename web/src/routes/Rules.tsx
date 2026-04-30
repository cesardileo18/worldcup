import { AppLayout, Card } from '../components';

type Example = {
  prediction: string;
  explanation: string;
  points: string;
  tone: string;
};

const winnerExamples: Example[] = [
  {
    prediction: '2 - 1',
    explanation: 'Acertaste el marcador exacto.',
    points: '10 pts',
    tone: 'text-green-400',
  },
  {
    prediction: '2 - 0',
    explanation: 'Acertaste que gana Argentina y los goles de Argentina.',
    points: '8 pts',
    tone: 'text-yellow-400',
  },
  {
    prediction: '3 - 1',
    explanation: 'Acertaste que gana Argentina y los goles de Brasil.',
    points: '8 pts',
    tone: 'text-yellow-400',
  },
  {
    prediction: '3 - 2',
    explanation: 'Acertaste que gana Argentina, pero ningun marcador exacto.',
    points: '6 pts',
    tone: 'text-yellow-400',
  },
  {
    prediction: '1 - 1',
    explanation: 'Pusiste empate, pero gano Argentina.',
    points: '0 pts',
    tone: 'text-red-400',
  },
  {
    prediction: '1 - 2',
    explanation: 'Pusiste que gana Brasil.',
    points: '0 pts',
    tone: 'text-red-400',
  },
];

const drawExamples: Example[] = [
  {
    prediction: '1 - 1',
    explanation: 'Acertaste el empate exacto.',
    points: '10 pts',
    tone: 'text-green-400',
  },
  {
    prediction: '0 - 0',
    explanation: 'Acertaste que era empate, pero no el marcador exacto.',
    points: '6 pts',
    tone: 'text-yellow-400',
  },
  {
    prediction: '2 - 2',
    explanation: 'Acertaste que era empate, pero no el marcador exacto.',
    points: '6 pts',
    tone: 'text-yellow-400',
  },
  {
    prediction: '1 - 0',
    explanation: 'No acertaste el empate.',
    points: '0 pts',
    tone: 'text-red-400',
  },
];

const ExampleTable = ({
  title,
  realScore,
  examples,
}: {
  title: string;
  realScore: string;
  examples: Example[];
}) => (
  <div className="overflow-hidden rounded-lg border border-white/10">
    <div className="bg-white/10 px-4 py-3">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/60">Resultado real: {realScore}</p>
    </div>
    <div className="divide-y divide-white/10">
      {examples.map((example) => (
        <div
          key={`${title}-${example.prediction}`}
          className="grid grid-cols-[72px_1fr_64px] items-center gap-3 px-4 py-3"
        >
          <span className="font-mono text-sm text-white">
            {example.prediction}
          </span>
          <span className="text-sm text-white/70">{example.explanation}</span>
          <span className={`${example.tone} text-right font-bold`}>
            {example.points}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export const Rules = () => {
  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 pb-8 pt-8">
        <h1 className="mb-8 text-3xl font-bold text-white">Reglas</h1>

        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Fecha limite para pronosticos
          </h2>
          <div className="flex items-start gap-3 text-white/80">
            <span className="text-2xl">Reloj</span>
            <p>
              Los pronosticos deben enviarse{' '}
              <span className="font-semibold text-white">
                al menos 10 minutos antes del inicio del partido
              </span>
              . Despues de eso, quedan bloqueados y no pueden modificarse.
            </p>
          </div>
        </Card>

        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Como se calculan los puntos
          </h2>

          <div className="space-y-5 text-white/80">
            <div className="flex items-start gap-3">
              <span className="text-2xl">10</span>
              <div>
                <h3 className="font-semibold text-white">
                  Marcador exacto: 10 puntos
                </h3>
                <p className="text-sm">
                  Si acertas exactamente los goles de los dos equipos, ganas 10
                  puntos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">8</span>
              <div>
                <h3 className="font-semibold text-white">
                  Ganador correcto y un marcador exacto: 8 puntos
                </h3>
                <p className="text-sm">
                  Si acertas quien gana y tambien acertas los goles de uno de
                  los dos equipos, ganas 8 puntos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">6</span>
              <div>
                <h3 className="font-semibold text-white">
                  Ganador correcto: 6 puntos
                </h3>
                <p className="text-sm">
                  Si acertas quien gana, pero no acertas el marcador de ningun
                  equipo, ganas 6 puntos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">6</span>
              <div>
                <h3 className="font-semibold text-white">
                  Empate correcto no exacto: 6 puntos
                </h3>
                <p className="text-sm">
                  Si el partido termina empatado y vos tambien pusiste empate,
                  pero con otro marcador, ganas 6 puntos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">0</span>
              <div>
                <h3 className="font-semibold text-white">
                  Resultado incorrecto: 0 puntos
                </h3>
                <p className="text-sm">
                  Si no acertas el ganador o no acertas que era empate, no
                  sumas puntos.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/10 p-4">
              <h3 className="mb-2 font-semibold text-white">
                No hay bonus por racha
              </h3>
              <p className="text-sm">
                Los puntos salen solamente de cada pronostico individual. No se
                suman puntos extra por acertar partidos seguidos.
              </p>
            </div>
          </div>

          <h2 className="mb-4 mt-8 text-xl font-semibold text-white">
            Ejemplos
          </h2>

          <div className="space-y-5">
            <ExampleTable
              title="Cuando hay un ganador"
              realScore="Argentina 2 - 1 Brasil"
              examples={winnerExamples}
            />

            <ExampleTable
              title="Cuando el partido termina empatado"
              realScore="Uruguay 1 - 1 Colombia"
              examples={drawExamples}
            />
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};
