import { useCallback, useState } from 'react';

import { fetchDocumentContent } from '../api';

interface DocumentViewButtonProps {
  patientId: string;
  documentId: string;
}

export function DocumentViewButton({ patientId, documentId }: DocumentViewButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleClick = useCallback(() => {
    setStatus('loading');
    fetchDocumentContent(patientId, documentId)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setStatus('idle');
      })
      .catch(() => {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
      });
  }, [patientId, documentId]);

  if (status === 'loading') {
    return <span className='text-muted-foreground text-xs'>…</span>;
  }
  if (status === 'error') {
    return <span className='text-destructive text-xs'>Error</span>;
  }
  return (
    <button type='button' onClick={handleClick} className='text-primary text-xs hover:underline'>
      View
    </button>
  );
}
