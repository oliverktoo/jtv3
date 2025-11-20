// Test the fixed stats object structure
const testStatsData = null; // Simulate no data

const stats = {
  total: testStatsData?.data?.total || 0,
  by_status: {
    SUBMITTED: testStatsData?.data?.submitted || 0,
    APPROVED: testStatsData?.data?.approved || 0,
    REJECTED: testStatsData?.data?.rejected || 0,
    WITHDRAWN: testStatsData?.data?.withdrawn || 0
  },
  approval_rate: testStatsData?.data?.total ? Math.round((testStatsData.data.approved / testStatsData.data.total) * 100) : 0,
  pending_review: testStatsData?.data?.submitted || 0
};

console.log('Stats object structure test:');
console.log('stats.by_status:', stats.by_status);
console.log('stats.by_status.APPROVED:', stats.by_status.APPROVED);
console.log('✅ No undefined access errors');