import dynamic from 'next/dynamic';

const Phase4Client = dynamic(() => import('./Phase4Client'), { ssr: false });

export default function Phase4Page() {
  return <Phase4Client />;
}
