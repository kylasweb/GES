import { LandingPage } from '@/components/LandingPage';
import { Header } from '@/components/layout/header';
import { DefaultFooter } from '@/components/layout/footers/DefaultFooter';

export default function LandingPageWrapper() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <LandingPage />
      </main>
      <DefaultFooter />
    </div>
  );
}