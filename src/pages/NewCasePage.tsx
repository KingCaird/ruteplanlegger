import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { useCreateCase } from '../hooks/useCreateCase'
import { caseStatuses } from '../lib/caseStatus'
import { getStatusTone } from '../lib/caseUi'
import { geocodeAddress } from '../lib/geocoding'
import type { GeocodedAddress } from '../lib/geocoding'
import type { CaseStatus } from '../types/database'

const inputClass =
  'rounded-md border border-[#c8d6e2] bg-white px-3 py-2 font-semibold text-[#1f2f55] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

export function NewCasePage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const createCase = useCreateCase()
  const [address, setAddress] = useState('')
  const [serial, setSerial] = useState('')
  const [status, setStatus] = useState<CaseStatus>('Normal')
  const [contact, setContact] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [geocodedAddress, setGeocodedAddress] =
    useState<GeocodedAddress | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)

  const isSubmitting = isGeocoding || createCase.isPending

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setGeocodedAddress(null)

    if (!session?.user.id) {
      setErrorMessage('Du må være innlogget for å opprette en sak.')
      return
    }

    setIsGeocoding(true)

    try {
      const coordinates = await geocodeAddress(address)
      setGeocodedAddress(coordinates)

      await createCase.mutateAsync({
        address,
        contact,
        lat: coordinates.lat,
        lng: coordinates.lng,
        note,
        phone,
        serial,
        status,
        userId: session.user.id,
      })

      navigate('/saker')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Kunne ikke opprette saken.'
      setErrorMessage(message)
    } finally {
      setIsGeocoding(false)
    }
  }

  return (
    <section>
      <PageHeader
        description="Registrer en ny sak og lagre den med koordinater."
        title="Ny sak"
      />
      <form className="case-card grid gap-4 p-6 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-bold text-[#1f2f55] md:col-span-2">
          Adresse
          <input
            className={inputClass}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Adresse"
            required
            type="text"
            value={address}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#1f2f55]">
          Serienummer
          <input
            className={inputClass}
            onChange={(event) => setSerial(event.target.value)}
            type="text"
            value={serial}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#1f2f55]">
          Status
          <select
            className={inputClass}
            onChange={(event) => setStatus(event.target.value as CaseStatus)}
            value={status}
          >
            {caseStatuses.map((caseStatus) => (
              <option key={caseStatus} value={caseStatus}>
                {getStatusTone(caseStatus).label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#1f2f55]">
          Kontaktperson
          <input
            className={inputClass}
            onChange={(event) => setContact(event.target.value)}
            type="text"
            value={contact}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#1f2f55]">
          Telefon
          <input
            className={inputClass}
            onChange={(event) => setPhone(event.target.value)}
            type="tel"
            value={phone}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#1f2f55] md:col-span-2">
          Notat
          <textarea
            className={inputClass}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            value={note}
          />
        </label>

        {geocodedAddress ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 md:col-span-2">
            <strong className="block">Adresse funnet</strong>
            <span className="block">{geocodedAddress.displayName}</span>
            <span className="block">
              {geocodedAddress.lat.toFixed(5)}, {geocodedAddress.lng.toFixed(5)}
            </span>
          </div>
        ) : null}

        {errorMessage ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 md:col-span-2">
            {errorMessage}
          </p>
        ) : null}

        <div className="md:col-span-2">
          <button
            className="case-action case-action-blue px-5"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Lagrer...' : 'Lagre sak'}
          </button>
        </div>
      </form>
    </section>
  )
}
