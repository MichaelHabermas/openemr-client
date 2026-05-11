import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useCreateProblem } from '../hooks';

interface CreateProblemFormProps {
  patientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateProblemForm({ patientId, onSuccess, onCancel }: CreateProblemFormProps) {
  const [name, setName] = useState('');
  const [clinicalStatus, setClinicalStatus] = useState('active');
  const { mutate, state } = useCreateProblem(patientId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const fhirResource = {
      resourceType: 'Condition',
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: clinicalStatus,
          },
        ],
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'confirmed',
          },
        ],
      },
      code: { text: name },
      subject: { reference: `Patient/${patientId}` },
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
        <Label htmlFor='problem-name'>Condition Name</Label>
        <Input id='problem-name' value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className='space-y-1'>
        <Label htmlFor='problem-status'>Clinical Status</Label>
        <Select
          id='problem-status'
          value={clinicalStatus}
          onChange={(e) => setClinicalStatus(e.target.value)}>
          <option value='active'>Active</option>
          <option value='recurrence'>Recurrence</option>
          <option value='relapse'>Relapse</option>
          <option value='inactive'>Inactive</option>
          <option value='remission'>Remission</option>
          <option value='resolved'>Resolved</option>
        </Select>
      </div>
      {state.status === 'error' ? (
        <p className='text-destructive text-xs'>{state.error.message}</p>
      ) : null}
      <div className='flex gap-2'>
        <Button type='submit' disabled={state.status === 'submitting'}>
          {state.status === 'submitting' ? 'Saving…' : 'Save Problem'}
        </Button>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
