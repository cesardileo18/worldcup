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
    points: '15 pts',
    tone: 'text-green-400',
  },
  {
    prediction: '3 - 1',
    explanation: 'Acertaste que gana Argentina. Te pasaste por 1 gol.',
    points: '9 pts',
    tone: 'text-yellow-400',
  },
  {
    prediction: '8 - 1',
    explanation: 'Acertaste que gana Argentina. Te pasaste por 6 goles.',
    points: '4 pts',
    tone: 'text-yellow-400',
  },
  {
    prediction: '8 - 5',
    explanation: 'Acertaste que gana Argentina, pero quedaste muy lejos.',
    points: '1 pt',
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
    explanation: 'Pusiste que gana Brazil.',
    points: '0 pts',
    tone: 'text-red-400',
  },
];

const drawExamples: Example[] = [
  {
    prediction: '0 - 0',
    explanation: 'Acertaste el empate exacto.',
    points: '15 pts',
    tone: 'text-green-400',
  },
  {
    prediction: '1 - 1',
    explanation: 'Acertaste empate. Fallaste por 1 gol de cada lado.',
    points: '8 pts',
    tone: 'text-yellow-400',
  },
  {
    prediction: '2 - 2',
    explanation: 'Acertaste empate. Fallaste por 2 goles de cada lado.',
    points: '6 pts',
    tone: 'text-yellow-400',
  },
  {
    prediction: '4 - 4',
    explanation: 'Acertaste empate, pero quedaste bastante lejos.',
    points: '2 pts',
    tone: 'text-yellow-400',
  },
  {
    prediction: '5 - 5',
    explanation: 'Acertaste empate, pero quedaste muy lejos.',
    points: '1 pt',
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
  <div className="border border-white/10 rounded-lg overflow-hidden">
    <div className="px-4 py-3 bg-white/10">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/60">Resultado real: {realScore}</p>
    </div>
    <div className="divide-y divide-white/10">
      {examples.map((example) => (
        <div
          key={`${title}-${example.prediction}`}
          className="grid grid-cols-[72px_1fr_64px] gap-3 px-4 py-3 items-center"
        >
          <span className="font-mono text-white text-sm">
            {example.prediction}
          </span>
          <span className="text-white/70 text-sm">{example.explanation}</span>
          <span className={`${example.tone} font-bold text-right`}>
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
      <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Reglas</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Fecha limite para pronosticos
          </h2>
          <div className="flex items-start gap-3 text-white/80">
            <span className="text-2xl">Reloj</span>
            <p>
              Los pronosticos deben enviarse{' '}
              <span className="text-white font-semibold">
                al menos 10 minutos antes del inicio del partido
              </span>
              . Despues de eso, quedan bloqueados y no pueden modificarse.
            </p>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Como se calculan los puntos
          </h2>

          <div className="space-y-5 text-white/80">
            <div className="flex items-start gap-3">
              <span className="text-2xl">15</span>
              <div>
                <h3 className="font-semibold text-white">
                  Marcador exacto: 15 puntos
                </h3>
                <p className="text-sm">
                  Si acertas exactamente los goles de los dos equipos, ganas 15
                  puntos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">10</span>
              <div>
                <h3 className="font-semibold text-white">
                  Ganador correcto o empate correcto: de 1 a 10 puntos
                </h3>
                <p className="text-sm">
                  Si acertas quien gana, o acertas que el partido termina
                  empatado, siempre sumas al menos 1 punto.
                </p>
                <p className="text-sm mt-2">
                  Para calcularlo, arrancamos desde 10 puntos y se resta 1
                  punto por cada gol de diferencia entre tu pronostico y el
                  resultado real. Si quedaste muy lejos, igual te queda 1 punto
                  por haber acertado el ganador o el empate.
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
                  Si pusiste que gana un equipo y gana el otro, o si pusiste
                  empate y no empataron, no sumas puntos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">+2</span>
              <div>
                <h3 className="font-semibold text-white">
                  Bonus por racha: 2 puntos extra
                </h3>
                <p className="text-sm">
                  Si acertas el resultado de dos partidos seguidos, sumas 2
                  puntos extra en la clasificacion.
                </p>
                <p className="text-sm mt-2">
                  Cuenta como acierto haber acertado el ganador o haber acertado
                  que era empate. No hace falta que el marcador sea exacto.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-white/10 border border-white/10 p-4">
              <h3 className="font-semibold text-white mb-2">
                Forma simple de pensarlo
              </h3>
              <p className="text-sm mb-2">
                Primero se revisa si acertaste el tipo de resultado: gana el
                local, gana el visitante o empatan.
              </p>
              <p className="text-sm">
                Si eso esta bien, se mide que tan cerca estuviste del marcador.
                Cuanto mas cerca, mas puntos. Cuanto mas lejos, menos puntos,
                pero nunca menos de 1.
              </p>
              <p className="text-sm mt-2">
                Despues se revisa la racha. Si acertaste dos partidos jugados
                uno atras del otro, se agregan 2 puntos extra al total.
              </p>
            </div>
          </div>

          <h2 className="mt-8 text-xl font-semibold text-white mb-4">
            Ejemplos
          </h2>

          <div className="space-y-5">
            <ExampleTable
              title="Cuando hay un ganador"
              realScore="Argentina 2 - 1 Brazil"
              examples={winnerExamples}
            />

            <ExampleTable
              title="Cuando el partido termina empatado"
              realScore="Uruguay 0 - 0 Colombia"
              examples={drawExamples}
            />

            <div className="rounded-lg bg-white/10 border border-white/10 p-4 text-white/80">
              <h3 className="font-semibold text-white mb-2">
                Ejemplo explicado: Argentina 2 - 1 Brazil
              </h3>
              <p className="text-sm mb-2">
                Si pusiste 8 - 1, acertaste que gana Argentina. Por eso entras
                en la regla de hasta 10 puntos.
              </p>
              <p className="text-sm mb-2">
                Argentina hizo 2 y vos pusiste 8: hay 6 goles de diferencia.
                Brazil hizo 1 y vos pusiste 1: hay 0 goles de diferencia.
              </p>
              <p className="text-sm font-semibold text-white">
                Entonces: 10 puntos menos 6 de diferencia = 4 puntos. Si la
                diferencia fuera de 10 goles o mas, igual sumarias 1 punto por
                haber acertado que ganaba Argentina.
              </p>
            </div>

            <div className="rounded-lg bg-white/10 border border-white/10 p-4 text-white/80">
              <h3 className="font-semibold text-white mb-2">
                Ejemplo de racha
              </h3>
              <p className="text-sm mb-2">
                Partido 1: acertaste que gana Argentina. Partido 2: acertaste
                que Uruguay y Colombia empatan.
              </p>
              <p className="text-sm font-semibold text-white">
                Como fueron dos aciertos seguidos, se suman 2 puntos extra a tu
                total.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};
