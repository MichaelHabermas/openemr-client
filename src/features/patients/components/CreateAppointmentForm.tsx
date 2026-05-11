import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useCreateAppointment } from '../hooks';

interface CreateAppointmentFormProps {
  patientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateAppointmentForm({
  patientId,
  onSuccess,
  onCancel,
}: CreateAppointmentFormProps) {
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [status, setStatus] = useState('proposed');
  const { mutate, state } = useCreateAppointment(patientId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!start) return;
    const fhirResource = {
      resourceType: 'Appointment',
      status,
      description: description || undefined,
      start: new Date(start).toISOString(),
      end: end ? new Date(end).toISOString() : undefined,
      participant: [
        {
          actor: { reference: `Patient/${patientId}` },
          status: 'accepted',
        },
      ],
    };
    mutate(fhirResource);
  }

  if (state.status === 'success') {
    onSuccess();
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-3 rounded-md border p-4'>
      <div className='space-y-1'>
        <Label htmlFor='appt-description'>Description</Label>
        <Input
          id='appt-description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <Label htmlFor='appt-start'>Start</Label>
          <Input
            id='appt-start'
            type='datetime-local'
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
        </div>
        <div className='space-y-1'>
          <Label htmlFor='appt-end'>End</Label>
          <Input
            id='appt-end'
            type='datetime-local'
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>
      <div className='space-y-1'>
        <Label htmlFor='appt-status'>Status</Label>
        <Select id='appt-status' value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value='proposed'>Proposed</option>
          <option value='pending'>Pending</option>
          <option value='booked'>Booked</option>
        </Select>
      </div>
      {state.status === 'error' ? (
        <p className='text-destructive text-xs'>{state.error.message}</p>
      ) : null}
      <div className='flex gap-2'>
        <Button type='submit' disabled={state.status === 'submitting'}>
          {state.status === 'submitting' ? 'Saving…' : 'Save Appointment'}
        </Button>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
