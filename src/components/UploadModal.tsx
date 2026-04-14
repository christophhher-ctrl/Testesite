import React, { useState } from 'react';
import { useAuth } from '@/src/lib/AuthContext';
import { storage, db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';

interface UploadModalProps {
  competitionId: string;
}

export function UploadModal({ competitionId }: UploadModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [studentSchool, setStudentSchool] = useState('');
  const [studentCity, setStudentCity] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 5MB');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !title || !studentName || !studentGrade || !studentSchool || !studentCity) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `photos/${competitionId}/${user.uid}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'photos'), {
        userId: user.uid,
        competitionId,
        imageUrl,
        title,
        description,
        studentName,
        studentGrade,
        studentSchool,
        studentCity,
        voteCount: 0,
        createdAt: serverTimestamp(),
      });

      toast.success('Foto enviada com sucesso!');
      setIsOpen(false);
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'photos');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStudentName('');
    setStudentGrade('');
    setStudentSchool('');
    setStudentCity('');
    setFile(null);
    setPreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all" />}>
        <Upload className="w-5 h-5" />
        Participar da Competição
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar sua Foto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpload} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Obra</Label>
            <Input 
              id="title" 
              placeholder="Dê um nome criativo para sua foto" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isUploading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Nome do Aluno</Label>
              <Input 
                id="studentName" 
                placeholder="Seu nome completo" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentGrade">Série</Label>
              <Input 
                id="studentGrade" 
                placeholder="Ex: 9º Ano" 
                value={studentGrade}
                onChange={(e) => setStudentGrade(e.target.value)}
                required
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentSchool">Escola</Label>
              <Input 
                id="studentSchool" 
                placeholder="Nome da escola" 
                value={studentSchool}
                onChange={(e) => setStudentSchool(e.target.value)}
                required
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentCity">Cidade</Label>
              <Input 
                id="studentCity" 
                placeholder="Sua cidade" 
                value={studentCity}
                onChange={(e) => setStudentCity(e.target.value)}
                required
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Input 
              id="description" 
              placeholder="Conte a história por trás da imagem" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label>Sua Foto</Label>
            {preview ? (
              <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary/20">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => { setFile(null); setPreview(null); }}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-primary/10">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium">
                    {isDragActive ? 'Solte a imagem aqui' : 'Arraste ou clique para selecionar'}
                  </div>
                  <p className="text-xs text-muted-foreground">JPG ou PNG, máx. 5MB</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUploading || !file || !title} className="min-w-[120px]">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Foto'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
