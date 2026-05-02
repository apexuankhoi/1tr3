import React from 'react';
import { Page, Box, Text, Button } from 'zmp-ui';
import { useGameStore } from '@/store/useGameStore';
import { adminService } from '@/services/api';

export default function ModeratorDashboardPage() {
  const t = useGameStore((state) => state.t);
  const [submissions, setSubmissions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [tab, setTab] = React.useState<'submissions' | 'users' | 'redemptions'>('submissions');

  React.useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'submissions') {
        const res: any = await adminService.getPendingSubmissions();
        setSubmissions(res || []);
      }
      // TODO: Add users and redemptions fetch if needed
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: number) => {
    try {
      await adminService.approveSubmission(submissionId);
      await loadData();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (submissionId: number) => {
    try {
      await adminService.rejectSubmission(submissionId);
      await loadData();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  return (
    <Page className="bg-white min-h-screen pb-20">
      <Box className="p-4">
        <Text size="xl" className="font-bold text-green-800 mb-6">
          {t('moderator.dashboard')}
        </Text>

        <Box className="flex gap-2 mb-6">
          <Button
            onClick={() => setTab('submissions')}
            className={`flex-1 py-2 rounded-lg ${
              tab === 'submissions'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t('moderator.submissions')}
          </Button>
          <Button
            onClick={() => setTab('users')}
            className={`flex-1 py-2 rounded-lg ${
              tab === 'users'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t('moderator.users')}
          </Button>
          <Button
            onClick={() => setTab('redemptions')}
            className={`flex-1 py-2 rounded-lg ${
              tab === 'redemptions'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t('moderator.redemptions')}
          </Button>
        </Box>

        {loading && <Text>{t('common.loading')}</Text>}

        {tab === 'submissions' && (
          <Box className="space-y-4">
            {submissions.length === 0 && !loading && (
              <Text className="text-gray-400 text-center py-8">
                {t('moderator.no_submissions')}
              </Text>
            )}

            {submissions.map((submission: any) => (
              <Box key={submission.id} className="p-4 border border-gray-200 rounded-lg">
                <Text size="sm" className="font-semibold">{submission.userName}</Text>
                <Text size="xs" className="text-gray-600">{submission.taskTitle}</Text>
                <Box className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleApprove(submission.id)}
                    className="flex-1 bg-green-600 text-white py-2 text-sm"
                  >
                    {t('moderator.approve')}
                  </Button>
                  <Button
                    onClick={() => handleReject(submission.id)}
                    className="flex-1 bg-red-600 text-white py-2 text-sm"
                  >
                    {t('moderator.reject')}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {tab === 'users' && (
          <Box className="p-4 bg-gray-50 rounded-lg text-center">
            <Text>{t('moderator.users_management')}</Text>
          </Box>
        )}

        {tab === 'redemptions' && (
          <Box className="p-4 bg-gray-50 rounded-lg text-center">
            <Text>{t('moderator.redemptions_tracking')}</Text>
          </Box>
        )}
      </Box>
    </Page>
  );
}
