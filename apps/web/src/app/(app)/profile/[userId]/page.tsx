'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/graphql';
import { USER_QUERY, SEND_CONNECTION_MUTATION } from '@/lib/queries';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { FreelancerProfileSections } from '@/components/profile/sections/FreelancerProfileSections';
import { FounderProfileSections } from '@/components/profile/sections/FounderProfileSections';
import { InvestorProfileSections } from '@/components/profile/sections/InvestorProfileSections';
import { SupplierProfileSections } from '@/components/profile/sections/SupplierProfileSections';
import { SupplierDisputeBanner } from '@/components/SupplierDisputeBanner';
import { ReportSupplierModal } from '@/components/ReportSupplierModal';
import type { ProfileUser } from '@/types/profile';

export default function UserProfilePage() {
  const params = useParams();
  const { data: session } = useSession();
  const userId = params.userId as string;

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionSent, setConnectionSent] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const client = createClient();
        const data = await client.request<{ user: ProfileUser }>(USER_QUERY, { id: userId });
        setUser(data.user);
      } catch {
        //
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  async function handleConnect() {
    setConnecting(true);
    try {
      const client = createClient();
      await client.request(SEND_CONNECTION_MUTATION, {
        input: { receiverId: userId, kind: 'collaboration' },
      });
      setConnectionSent(true);
    } catch {
      //
    } finally {
      setConnecting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <div className="h-64 rounded-xl bg-neutral-200 animate-pulse" />
        <div className="h-40 rounded-xl bg-neutral-200 animate-pulse" />
        <div className="h-40 rounded-xl bg-neutral-200 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-display-sm font-semibold text-neutral-700 mb-2">User not found</h2>
        <p className="text-neutral-500 mb-6">This profile may have been removed.</p>
        <Button variant="ghost" asChild>
          <Link href="/discover/talent">Browse Talent</Link>
        </Button>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === userId;

  const roleSectionsMap: Record<string, React.ComponentType<{ user: ProfileUser; isOwnProfile: boolean }>> = {
    freelancer: FreelancerProfileSections,
    founder: FounderProfileSections,
    investor: InvestorProfileSections,
    supplier: SupplierProfileSections,
  };
  const RoleSections = roleSectionsMap[user.role] ?? FreelancerProfileSections;

  const hasDispute = (user as ProfileUser & { hasDispute?: boolean }).hasDispute ?? false;
  const isSupplier = user.role === 'supplier';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        onConnect={handleConnect}
        connectionSent={connectionSent}
        connecting={connecting}
      />

      {isSupplier && hasDispute && !isOwnProfile && (
        <SupplierDisputeBanner
          supplierId={userId}
          onReport={() => setReportModalOpen(true)}
        />
      )}

      <RoleSections user={user} isOwnProfile={isOwnProfile} />

      {reportModalOpen && (
        <ReportSupplierModal
          supplierId={userId}
          supplierName={user.profile?.displayName ?? user.email}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </div>
  );
}
