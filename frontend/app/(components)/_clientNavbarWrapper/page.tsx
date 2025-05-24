'use client';

import { usePathname } from 'next/navigation';
import Navbar from '../navbar/Navbar';

export default function ClientNavbarWrapper() {
  const pathname = usePathname();

  // Render Navbar on all routes except "/"
  if (pathname === '/') return null;

  return <Navbar onSignupClick={() => console.log('Signup clicked')} />;
}