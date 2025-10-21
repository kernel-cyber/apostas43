import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Upload, ArrowLeft, Edit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboard from '@/components/admin/AdminDashboard';
import EventForm from '@/components/admin/EventForm';
import EventList from '@/components/admin/EventList';
import MatchForm from '@/components/admin/MatchForm';
import MatchList from '@/components/admin/MatchList';
import EditPilotModal from '@/components/admin/EditPilotModal';
import BracketGenerator from '@/components/admin/BracketGenerator';
import Top20Management from '@/components/admin/Top20Management';
import AdminStats from '@/components/admin/AdminStats';

interface Pilot {
  id: string;
  name: string;
  car_name: string;
  car_model: string | null;
  image_url: string | null;
  position: number | null;
  wins: number;
  losses: number;
  total_races: number;
}

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPilot, setSelectedPilot] = useState<Pilot | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    car_name: '',
    car_model: '',
    team: '',
    position: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    fetchPilots();
  }, []);

  const fetchPilots = async () => {
    const { data, error } = await (supabase as any)
      .from('pilots')
      .select('*')
      .order('position', { ascending: true, nullsFirst: false });
    
    if (error) {
      toast({
        title: "Erro ao carregar pilotos",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setPilots(data || []);
    }
  };

  const handleImageUpload = async (pilotId: string): Promise<string | null> => {
    if (!selectedImage) return null;

    setUploadingImage(true);
    const fileExt = selectedImage.name.split('.').pop();
    const fileName = `${pilotId}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('pilot-images')
      .upload(filePath, selectedImage, { upsert: true });

    setUploadingImage(false);

    if (uploadError) {
      toast({
        title: "Erro ao fazer upload da imagem",
        description: uploadError.message,
        variant: "destructive"
      });
      return null;
    }

    const { data } = supabase.storage
      .from('pilot-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { data: newPilot, error } = await (supabase as any)
      .from('pilots')
      .insert([{
        name: formData.name,
        car_name: formData.car_name,
        car_model: formData.car_model || null,
        team: formData.team || null,
        position: formData.position ? parseInt(formData.position) : null
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro ao adicionar piloto",
        description: error.message,
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Upload image if selected
    if (selectedImage && newPilot) {
      const imageUrl = await handleImageUpload(newPilot.id);
      
      if (imageUrl) {
        await (supabase as any)
          .from('pilots')
          .update({ image_url: imageUrl })
          .eq('id', newPilot.id);
      }
    }

    toast({
      title: "Piloto adicionado!",
      description: `${formData.name} foi adicionado com sucesso.`
    });

    setFormData({ name: '', car_name: '', car_model: '', team: '', position: '' });
    setSelectedImage(null);
    setIsLoading(false);
    fetchPilots();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja deletar ${name}?`)) return;

    const { error } = await (supabase as any)
      .from('pilots')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao deletar piloto",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Piloto deletado",
        description: `${name} foi removido.`
      });
      fetchPilots();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-racing-dark">
        <Loader2 className="w-8 h-8 animate-spin text-racing-green" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-racing-dark p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white font-racing">
              Painel Administrativo
            </h1>
            <p className="text-racing-gray mt-2">Gerencie pilotos e eventos</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="pilots">Pilotos</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="top20">TOP 20</TabsTrigger>
            <TabsTrigger value="bracket">Chaveamento</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AdminStats />
            <AdminDashboard />
            
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>📖 Como Usar o Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Sistema automatizado de gerenciamento de matches e chaveamentos.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin-guide')}
                  className="w-full"
                >
                  Ver Guia Completo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pilots" className="space-y-6">
            <Card className="bg-racing-dark/50 border-racing-green/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Adicionar Novo Piloto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Piloto *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-racing-dark/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="car_name">Nome do Carro *</Label>
                      <Input
                        id="car_name"
                        value={formData.car_name}
                        onChange={(e) => setFormData({ ...formData, car_name: e.target.value })}
                        required
                        className="bg-racing-dark/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="car_model">Modelo do Carro</Label>
                      <Input
                        id="car_model"
                        value={formData.car_model}
                        onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
                        className="bg-racing-dark/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team">Equipe *</Label>
                      <Input
                        id="team"
                        value={formData.team}
                        onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                        required
                        className="bg-racing-dark/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Posição (1-20)</Label>
                      <Input
                        id="position"
                        type="number"
                        min="1"
                        max="20"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="bg-racing-dark/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Foto do Piloto/Carro</Label>
                    <div className="flex gap-2">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                        className="bg-racing-dark/50"
                      />
                      {selectedImage && (
                        <Button type="button" variant="outline" size="icon" onClick={() => setSelectedImage(null)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading || uploadingImage} className="w-full">
                    {isLoading || uploadingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploadingImage ? 'Fazendo upload...' : 'Adicionando...'}
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Piloto
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-racing-dark/50 border-racing-green/20">
              <CardHeader>
                <CardTitle>Pilotos Cadastrados ({pilots.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pilots.map((pilot) => (
                    <Card key={pilot.id} className="bg-racing-dark border-racing-green/10">
                      <CardContent className="p-4">
                        {pilot.image_url && (
                          <img
                            src={pilot.image_url}
                            alt={pilot.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        <div className="space-y-1">
                          <h3 className="font-bold text-white">{pilot.name}</h3>
                          <p className="text-sm text-racing-yellow">{pilot.car_name}</p>
                          {pilot.car_model && (
                            <p className="text-xs text-racing-gray">{pilot.car_model}</p>
                          )}
                          {(pilot as any).team && (
                            <p className="text-xs text-blue-400">{(pilot as any).team}</p>
                          )}
                          {pilot.position && (
                            <p className="text-sm text-racing-green">Posição: #{pilot.position}</p>
                          )}
                          <p className="text-xs text-racing-gray">
                            {pilot.wins}V - {pilot.losses}D
                          </p>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedPilot(pilot);
                              setEditModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDelete(pilot.id, pilot.name)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="bg-racing-dark/50 border-racing-green/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Criar Novo Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EventForm />
              </CardContent>
            </Card>

            <Card className="bg-racing-dark/50 border-racing-green/20">
              <CardHeader>
                <CardTitle>Eventos Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <EventList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Criar Novo Match
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MatchForm />
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle>Matches Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <MatchList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top20" className="space-y-6">
            <Top20Management />
          </TabsContent>

          <TabsContent value="bracket" className="space-y-6">
            <BracketGenerator eventId="" />
          </TabsContent>
        </Tabs>

        {selectedPilot && (
          <EditPilotModal
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            pilot={selectedPilot}
            onSuccess={fetchPilots}
          />
        )}
      </div>
    </div>
  );
}
