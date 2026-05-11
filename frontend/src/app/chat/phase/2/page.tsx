import dynamic from 'next/dynamic';

const Phase2Client = dynamic(() => import('./Phase2Client'), { ssr: false });

export default function Phase2Page() {
  return <Phase2Client />;
}
