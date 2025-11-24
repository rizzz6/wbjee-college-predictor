import { Autocomplete } from '@sanity/ui'
import { useClient } from 'sanity'
import { useEffect, useState } from 'react'
import { PatchEvent, set, unset } from 'sanity'

interface CutoffInstituteInputProps {
  value?: string
  onChange: (patch: PatchEvent) => void
}

export default function CutoffInstituteInput({ value, onChange }: CutoffInstituteInputProps) {
  const client = useClient({ apiVersion: '2024-01-01' })
  const [institutes, setInstitutes] = useState<string[]>([])

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const result = await client.fetch(`array::unique(*[_type == "collegeCutoff"].institute)`)
        setInstitutes(result || [])
      } catch (error) {
        console.error('Error fetching institutes:', error)
      }
    }

    fetchInstitutes()
  }, [client])

  const options = institutes.map((institute) => ({
    value: institute,
  }))

  return (
    <Autocomplete
      id="cutoff-institute-input"
      value={value || ''}
      onChange={(newValue) => {
        onChange(PatchEvent.from(newValue ? set(newValue) : unset()))
      }}
      options={options}
      placeholder="Search for institute name..."
      filterOption={(query, option) =>
        option.value.toLowerCase().includes(query.toLowerCase())
      }
    />
  )
}