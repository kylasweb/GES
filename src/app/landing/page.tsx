import { LandingPage } from '@/components/LandingPage';
import { Header } from '@/components/layout/header';
import { DefaultFooter } from '@/components/layout/footers/DefaultFooter';

export default function LandingPageWrapper() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <main className="flex-grow">
        <LandingPage />
      </main>
      <div className="mt-auto">
        <DefaultFooter />
      </div>
    </div>
  );
}