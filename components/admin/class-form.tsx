'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface ClassFormData {
  title: string
  description: string
  duration: number
  tags: string[]
  max_capacity: number
  coach: string
  location: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | ''
}

interface ClassFormProps {
  initialData?: Partial<ClassFormData>
  classId?: string
}

export function ClassForm({ initialData, classId }: ClassFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState<ClassFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    duration: initialData?.duration || 60,
    tags: initialData?.tags || [],
    max_capacity: initialData?.max_capacity || 10,
    coach: initialData?.coach || '',
    location: initialData?.location || '',
    difficulty_level: initialData?.difficulty_level || '',
  })

  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: keyof ClassFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const classData = {
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        tags: formData.tags,
        max_capacity: formData.max_capacity,
        coach: formData.coach,
        location: formData.location,
        difficulty_level: formData.difficulty_level,
      }

      if (classId) {
        // Update existing class
        const { error: updateError } = await supabase
          .from('classes')
          .update(classData)
          .eq('id', classId)

        if (updateError) throw updateError
      } else {
        // Create new class
        const { error: insertError } = await supabase
          .from('classes')
          .insert([classData])

        if (insertError) throw insertError
      }

      router.push('/admin/classes')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Une erreur s\'est produite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Titre du cours *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Ex: Yoga Flow débutant"
            required
          />
        </div>

        {/* Coach */}
        <div className="space-y-2">
          <Label htmlFor="coach">Coach *</Label>
          <Input
            id="coach"
            value={formData.coach}
            onChange={(e) => handleInputChange('coach', e.target.value)}
            placeholder="Ex: Marie Dubois"
            required
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration">Durée (minutes) *</Label>
          <Input
            id="duration"
            type="number"
            min="15"
            max="180"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
            required
          />
        </div>

        {/* Max Capacity */}
        <div className="space-y-2">
          <Label htmlFor="max_capacity">Capacité maximale *</Label>
          <Input
            id="max_capacity"
            type="number"
            min="1"
            max="50"
            value={formData.max_capacity}
            onChange={(e) => handleInputChange('max_capacity', parseInt(e.target.value) || 10)}
            required
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Lieu *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Ex: Salle A, Studio principal"
            required
          />
        </div>

        {/* Difficulty Level */}
        <div className="space-y-2">
          <Label htmlFor="difficulty_level">Niveau de difficulté *</Label>
          <Select
            value={formData.difficulty_level}
            onValueChange={(value) => handleInputChange('difficulty_level', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Débutant</SelectItem>
              <SelectItem value="intermediate">Intermédiaire</SelectItem>
              <SelectItem value="advanced">Avancé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Décrivez le cours, les exercices, les bénéfices..."
          rows={4}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ajoutez un tag (Ex: yoga, cardio, force)"
            />
            <Button type="button" variant="outline" onClick={addTag}>
              Ajouter
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : classId ? 'Mettre à jour' : 'Créer le cours'}
        </Button>
      </div>
    </form>
  )
}