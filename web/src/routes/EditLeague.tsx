import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  AppLayout,
  Card,
  Button,
  LinkButton,
  LeaguePicture,
  useConfirm,
} from '../components';
import { useAuth, useToast } from '../hooks';
import {
  checkSlugAvailable,
  deleteLeague,
  generateSlug,
  getLeagueBySlug,
  updateLeague,
  uploadLeagueImage,
  type LeagueWithId,
} from '../services';

export const EditLeague = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showConfirm, ConfirmDialogComponent } = useConfirm();
  const { showToast } = useToast();
  const [league, setLeague] = React.useState<LeagueWithId | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState('');
  const [slugInput, setSlugInput] = React.useState('');
  const [originalSlug, setOriginalSlug] = React.useState('');
  const [slugStatus, setSlugStatus] = React.useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [description, setDescription] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isOwner = user && league?.ownerId === user.uid;
  const isAdmin = userData?.admin === true;
  const canDelete = isOwner || isAdmin;

  const handleDelete = async () => {
    if (!league || !canDelete) return;

    const confirmed = await showConfirm({
      title: 'Eliminar liga',
      message: `¿Seguro que quieres eliminar de forma permanente "${league.name}"? Esto quitará a todos los miembros y no se puede deshacer.`,
      confirmText: 'Eliminar liga',
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteLeague(league.id, league.slug);
      showToast('Liga eliminada correctamente');
      void navigate('/leagues', { replace: true });
    } catch (err) {
      console.error(err);
      showToast('No se pudo eliminar la liga', 'error');
      setDeleting(false);
    }
  };

  // Load league data
  React.useEffect(() => {
    if (!slug) return;

    const loadLeague = async () => {
      setLoading(true);
      const leagueData = await getLeagueBySlug(slug);
      setLeague(leagueData);

      if (leagueData) {
        setName(leagueData.name);
        setSlugInput(leagueData.slug);
        setOriginalSlug(leagueData.slug);
        setDescription(leagueData.description || '');
      }

      setLoading(false);
    };

    void loadLeague();
  }, [slug]);

  // Check slug availability
  React.useEffect(() => {
    const sanitizedSlug = generateSlug(slugInput);

    // If slug is empty or same as original, don't check
    if (!sanitizedSlug || sanitizedSlug === originalSlug) {
      setSlugStatus('idle');
      return;
    }

    // Validate slug format
    if (sanitizedSlug.length < 2) {
      setSlugStatus('invalid');
      return;
    }

    setSlugStatus('checking');

    const checkAvailability = async () => {
      const isAvailable = await checkSlugAvailable(sanitizedSlug);
      setSlugStatus(isAvailable ? 'available' : 'taken');
    };

    const timeout = setTimeout(() => {
      void checkAvailability();
    }, 300);

    return () => clearTimeout(timeout);
  }, [slugInput, originalSlug]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Selecciona un archivo de imagen');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe pesar menos de 5 MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!league || !isOwner) return;
    if (slugStatus === 'taken' || slugStatus === 'invalid') return;

    const finalSlug = generateSlug(slugInput);

    setSaving(true);
    setError(null);

    try {
      let newImageURL = league.imageURL ?? '';

      // Upload new image if selected
      if (selectedFile) {
        newImageURL = await uploadLeagueImage(league.id, selectedFile);
      }

      await updateLeague(
        league.id,
        {
          name,
          description,
          imageURL: newImageURL,
          slug: finalSlug,
        },
        originalSlug
      );

      void navigate(`/league/${finalSlug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la liga');
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors';
  const labelClass = 'block text-white/70 text-sm mb-2';

  if (loading) {
    return (
      <AppLayout>
        <div className="pt-8 px-4 pb-8 max-w-md mx-auto">
          <div className="text-center text-white/70 py-20">Cargando...</div>
        </div>
      </AppLayout>
    );
  }

  if (!league) {
    return (
      <AppLayout>
        <div className="pt-8 px-4 pb-8 max-w-md mx-auto">
          <Card className="p-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Liga no encontrada
            </h1>
            <Link to="/leagues" className="text-white/70 hover:text-white">
              ← Volver a mis ligas
            </Link>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!isOwner) {
    return (
      <AppLayout>
        <div className="pt-8 px-4 pb-8 max-w-md mx-auto">
          <Card className="p-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              No autorizado
            </h1>
            <p className="text-white/70 mb-4">
              Solo el dueño de la liga puede editar esta liga.
            </p>
            <Link
              to={`/league/${league.slug}`}
              className="text-white/70 hover:text-white"
            >
              ← Volver a la liga
            </Link>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="md:min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">
              Editar liga
            </h1>

            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="flex flex-col gap-4"
            >
              {/* League Image */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <LeaguePicture
                    src={previewUrl ?? league.imageURL}
                    name={league.name}
                    size="xl"
                    className="border-2 border-white/20"
                  />
                  {previewUrl && (
                    <Button
                      onClick={handleRemovePhoto}
                      className="absolute px-0! -top-1 -right-1 rounded-full w-8 h-8 backdrop-blur-lg border-none opacity-70 hover:opacity-100"
                      title="Deshacer"
                    >
                      <span className="text-sm">↩️</span>
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="league-image-upload"
                />
                <label
                  htmlFor="league-image-upload"
                  className="text-sm text-white/60 hover:text-white cursor-pointer transition-colors"
                >
                  Cambiar imagen
                </label>
              </div>

              {/* League Name */}
              <div>
                <label htmlFor="name" className={labelClass}>
                  Nombre de la liga
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre de la liga"
                  className={inputClass}
                  required
                />
              </div>

              {/* Slug / URL */}
              <div>
                <label htmlFor="slug" className={labelClass}>
                  URL
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-sm pointer-events-none">
                    /league/
                  </span>
                  <input
                    id="slug"
                    type="text"
                    value={slugInput}
                    onChange={(e) =>
                      setSlugInput(
                        e.target.value.toLowerCase().replace(/\s+/g, '-')
                      )
                    }
                    placeholder="league-url"
                    className={`${inputClass} pl-18 ${slugStatus === 'taken' || slugStatus === 'invalid' ? 'border-red-400' : slugStatus === 'available' ? 'border-green-400' : ''}`}
                    required
                  />
                  {slugStatus === 'checking' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">
                      Verificando...
                    </span>
                  )}
                  {slugStatus === 'available' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-sm">
                      ✓ Disponible
                    </span>
                  )}
                  {slugStatus === 'taken' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-sm">
                      ✗ Ocupado
                    </span>
                  )}
                  {slugStatus === 'invalid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-sm">
                      ✗ Muy corto
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className={labelClass}>
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="¿De qué trata esta liga?"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 mt-4">
                <LinkButton
                  to={`/league/${league.slug}`}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancelar
                </LinkButton>
                <Button
                  type="submit"
                  disabled={
                    saving ||
                    deleting ||
                    !name.trim() ||
                    !slugInput.trim() ||
                    slugStatus === 'taken' ||
                    slugStatus === 'invalid' ||
                    slugStatus === 'checking'
                  }
                  className="flex-1"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>

              {/* Delete option */}
              {canDelete && (
                <div className="mt-6 pt-4 border-t border-white/10 text-center">
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={deleting}
                    className="text-sm text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-50 hover:cursor-pointer"
                  >
                    {deleting ? 'Eliminando...' : 'Eliminar esta liga'}
                  </button>
                </div>
              )}
            </form>
          </Card>
          {ConfirmDialogComponent}
        </div>
      </div>
    </AppLayout>
  );
};
