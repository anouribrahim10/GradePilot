import dynamic from 'next/dynamic';

const Phase1Client = dynamic(() => import('./Phase1Client'), { ssr: false });

export default function Phase1Page() {
  return <Phase1Client />;
}
