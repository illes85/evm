import { useEffect, useMemo } from 'react'
import { Button } from '../ui/Button'

interface LogoUploadProps {
  logoBlob: Blob | undefined
  onChange: (blob: Blob | undefined) => void
}

const MAX_LOGO_SIZE = 500 * 1024

export function LogoUpload({ logoBlob, onChange }: LogoUploadProps) {
  const previewUrl = useMemo(() => (logoBlob ? URL.createObjectURL(logoBlob) : undefined), [logoBlob])

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > MAX_LOGO_SIZE) {
      alert('A logó mérete túl nagy (max ~500KB). Válassz egy kisebb képet.')
    }
    onChange(file)
    event.target.value = ''
  }

  return (
    <div className="flex items-center gap-4">
      {previewUrl ? (
        <img src={previewUrl} alt="Cég logó" className="h-16 w-16 rounded border border-slate-200 object-contain" />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed border-slate-300 text-xs text-slate-400">
          Nincs logó
        </div>
      )}
      <div className="flex gap-2">
        <label>
          <span className="sr-only">Logó feltöltése</span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="logo-upload-input" />
          <Button type="button" onClick={() => document.getElementById('logo-upload-input')?.click()}>
            Logó feltöltése
          </Button>
        </label>
        {logoBlob && (
          <Button type="button" variant="ghost" onClick={() => onChange(undefined)}>
            Eltávolítás
          </Button>
        )}
      </div>
    </div>
  )
}
