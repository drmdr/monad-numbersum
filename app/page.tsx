import { APP_URL } from '@/lib/constants';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

// 動的にクライアントコンポーネントをインポートし、サーバーサイドレンダリング(SSR)を無効にする
const App = dynamic(() => import('@/components/pages/app'), { ssr: false });

const frame = {
  version: 'next',
  // TODO: ゲーム画面のサムネイルに差し替える
  imageUrl: `${APP_URL}/images/feed.png`,
  button: {
    title: 'Launch Number Sum',
    action: {
      type: 'launch_frame',
      name: 'Monad Number Sum',
      url: APP_URL,
      splashImageUrl: `${APP_URL}/images/splash.png`,
      splashBackgroundColor: '#f7f7f7',
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Monad Number Sum',
    openGraph: {
      title: 'Monad Number Sum',
      description: 'A number puzzle game on Farcaster and Monad',
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
