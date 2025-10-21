import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';

interface EditPilotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pilot: any;
  onSuccess: () => void;
}

export default function EditPilotModal({ open, onOpenChange, pilot, onSuccess }: EditPilotModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: pilot?.name || '',
    car_name: pilot?.car_name || '',
    car_model: pilot?.car_model || '',
    team: pilot?.team || '',
    position: pilot?.position || '',
  });

  // #6 FIX: Reset form quando o modal abre ou piloto muda
  useEffect(() => {
    if (open && pilot) {
      setFormData({
        name: pilot.name || '',
        car_name: pilot.car_name || '',
        car_model: pilot.car_model || '',
        team: pilot.team || '',
        position: pilot.position || '',
      });
      setImagePreview(pilot.image_url || null);
      setImageFile(null);
    }
  }, [open, pilot]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'A imagem deve ter no máximo 2MB.',
          variant: 'destructive',
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Tipo inválido',
          description: 'Apenas imagens são permitidas.',
          variant: 'destructive',
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let imageUrl = pilot.image_url;

    // #3: Upload de imagem se houver
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${pilot.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pilot-images')
        .upload(filePath, imageFile, { upsert: true });

      if (uploadError) {
        toast({
          title: 'Erro ao fazer upload',
          description: uploadError.message,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from('pilot-images')
        .getPublicUrl(filePath);
      
      imageUrl = data.publicUrl;
    }

    const { error } = await (supabase as any)
      .from('pilots')
      .update({
        name: formData.name,
        car_name: formData.car_name,
        car_model: formData.car_model || null,
        team: formData.team || null,
        position: formData.position ? parseInt(formData.position) : null,
        image_url: imageUrl,
      })
      .eq('id', pilot.id);

    if (error) {
      toast({
        title: 'Erro ao atualizar piloto',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Piloto atualizado!',
        description: 'As informações foram atualizadas com sucesso.',
      });
      onSuccess();
      onOpenChange(false);
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-racing-dark border-racing-green/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-racing text-white">
            Editar Piloto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* #3: Upload de Foto */}
          <div className="space-y-2">
            <Label htmlFor="edit_image">Foto do Piloto</Label>
            {imagePreview && (
              <div className="relative w-32 h-32 mx-auto">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="edit_image"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-racing-dark/50 hover:bg-racing-dark/70 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Clique para enviar</span> ou arraste
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 2MB)</p>
                </div>
                <input
                  id="edit_image"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_name">Nome do Piloto</Label>
            <Input
              id="edit_name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-racing-dark/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_car_name">Nome do Carro</Label>
            <Input
              id="edit_car_name"
              value={formData.car_name}
              onChange={(e) => setFormData({ ...formData, car_name: e.target.value })}
              required
              className="bg-racing-dark/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_car_model">Modelo do Carro</Label>
            <Input
              id="edit_car_model"
              value={formData.car_model}
              onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
              className="bg-racing-dark/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_team">Equipe</Label>
            <Input
              id="edit_team"
              value={formData.team}
              onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              className="bg-racing-dark/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_position">Posição (1-20)</Label>
            <Input
              id="edit_position"
              type="number"
              min="1"
              max="20"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="bg-racing-dark/50"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
