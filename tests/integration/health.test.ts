import { describe, it, expect, vi } from 'vitest';
import { GET } from '../../app/api/health/route';
import { prisma } from '../../lib/db/prisma';

vi.mock('../../lib/db/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  }
}));

describe('Health check API', () => {
  it('returns ok status when database is reachable', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([1]);
    
    const res = await GET();
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.database).toBe('ok');
  });

  it('returns 503 status when database is unreachable', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('Connection failed'));
    
    const res = await GET();
    const data = await res.json();
    
    expect(res.status).toBe(503);
    expect(data.status).toBe('error');
    expect(data.database).toBe('unreachable');
  });
});
