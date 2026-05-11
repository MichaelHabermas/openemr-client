import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useCreateAllergy } from '../hooks';

interface CreateAllergyFormProps {
  patientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateAllergyForm({ patientId, onSuccess, onCancel }: CreateAllergyFormProps) {
  const [substance, setSubstance] = useState('');
  const [clinicalStatus, setClinicalStatus] = useState('active');
  const [criticality, setCriticality] = useState('low');
  const { mutate, state } = useCreateAllergy(patientId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!substance.trim()) return;
    const fhirResource = {
      resourceType: 'AllergyIntolerance',
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
            code: clinicalStatus,
          },
        ],
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
            code: 'confirmed',
          },
        ],
      },
      code: { text: substance },
      patient: { reference: `Patient/${patientId}` },
      criticality,
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
        <Label htmlFor='allergy-substance'>Substance</Label>
        <Input
          id='allergy-substance'
          value={substance}
          onChange={(e) => setSubstance(e.target.value)}
          required
        />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-1'>
          <Label htmlFor='allergy-status'>Clinical Status</Label>
          <Select
            id='allergy-status'
            value={clinicalStatus}
            onChange={(e) => setClinicalStatus(e.target.value)}>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
            <option value='resolved'>Resolved</option>
          </Select>
        </div>
        <div className='space-y-1'>
          <Label htmlFor='allergy-criticality'>Criticality</Label>
          <Select
            id='allergy-criticality'
            value={criticality}
            onChange={(e) => setCriticality(e.target.value)}>
            <option value='low'>Low</option>
            <option value='high'>High</option>
            <option value='unable-to-assess'>Unable to Assess</option>
          </Select>
        </div>
      </div>
      {state.status === 'error' ? (
        <p className='text-destructive text-xs'>{state.error.message}</p>
      ) : null}
      <div className='flex gap-2'>
        <Button type='submit' disabled={state.status === 'submitting'}>
          {state.status === 'submitting' ? 'Saving…' : 'Save Allergy'}
        </Button>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
