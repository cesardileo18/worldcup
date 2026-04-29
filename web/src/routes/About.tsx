import { AppLayout, Card } from '../components';
import { createdByPic } from '../assets';

export const About = () => {
  return (
    <AppLayout>
      <div className="md:min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <Card className="p-6">
            {/* Project Description */}
            <div className="mb-6">
              <div className="flex flex-row items-center justify-center gap-4 mb-8 mt-4">
                <img
                  src="/iqfutbol.png"
                  alt="IQ Futbol"
                  className="h-16 w-16 object-contain"
                />
                <div className="flex flex-col items-start">
                  <h2 className="md:text-2xl text-lg font-semibold text-white">
                    IQ Futbol
                  </h2>
                  <img
                    src="/DataIQ-Logo1.png"
                    alt="DataIQ"
                    className="h-4 w-fit opacity-80"
                  />
                </div>
              </div>
              <p className="text-white/80">
                Un juego de pronósticos del Mundial FIFA 2026 divertido y competitivo. Adivina los marcadores, desafía a tus amigos y familiares, y sube en la clasificación para presumir.
              </p>
            </div>

            <hr className="border-white/10 mb-6" />

            {/* Created by */}
            <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div className="flex items-center gap-3">
                <img
                  src={createdByPic}
                  alt="Jonathan Hernández"
                  className="w-6 h-6 rounded-full object-cover"
                />
                <h2 className="md:text-xl text-lg font-semibold">
                  Creado por Jonathan Hernández
                </h2>
              </div>
              <div className="flex gap-2 text-sm">
                <a
                  href="https://github.com/ionmx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  GitHub
                </a>
                <span className="text-white/20">•</span>
                <a
                  href="https://www.linkedin.com/in/ionmx/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            <hr className="border-white/10 mb-6" />

            {/* Contribuir */}
            <div className="mb-6">
              <h2 className="md:text-xl text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🤝</span> Contribuir
              </h2>
              <p className="text-white/80 mb-4">
                ¡Este proyecto es de código abierto! Las contribuciones, reportes de errores y sugerencias de funcionalidades son bienvenidas. Está hecho con React, Firebase y Tailwind CSS — aquí no hace falta VAR 😉
              </p>
              <a
                href="https://github.com/ionmx/worldcup-2026-pool"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ⭐ Dale una estrella en GitHub
              </a>
            </div>

            <hr className="border-white/10 mb-6" />

            {/* Apoyar */}
            <div>
              <h2 className="md:text-xl text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>☕</span> Apoyar
              </h2>
              <p className="text-white/80 mb-4">
                Si te gusta este proyecto, considera invitarme un café para apoyar el desarrollo futuro.
              </p>
              <a
                href="https://www.buymeacoffee.com/ionmx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://img.buymeacoffee.com/button-api/?text=Inv%C3%ADtame%20un%20caf%C3%A9&emoji=&slug=ionmx&button_colour=FFDD00&font_colour=000000&font_family=Bree&outline_colour=000000&coffee_colour=ffffff"
                  alt="Invítame un café"
                  className="h-10"
                />
              </a>
            </div>
          </Card>

          <p className="text-white/50 text-sm text-center my-8">
            Hecho con 🫶 para los fans
          </p>
        </div>
      </div>
    </AppLayout>
  );
};
