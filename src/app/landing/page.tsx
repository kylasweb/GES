import { LandingPage } from '@/components/LandingPage';
import { Header } from '@/components/layout/header';
import { ResponsiveLayout } from '@/components/layout/responsive-layout';

export default function LandingPageWrapper() {
  return (
    <ResponsiveLayout headerVariant="transparent">
      <LandingPage />
    </ResponsiveLayout>
  );
}