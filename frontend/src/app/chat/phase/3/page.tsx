import dynamic from 'next/dynamic';

const Phase3Client = dynamic(() => import('./Phase3Client'), { ssr: false });

export default function Phase3Page() {
  return <Phase3Client />;
}
