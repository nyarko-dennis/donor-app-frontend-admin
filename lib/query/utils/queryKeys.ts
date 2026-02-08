export const queryKeys = {
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
  },
  campaigns: {
    all: ['campaigns'] as const,
    detail: (id: string) => ['campaigns', id] as const,
  },
  donors: {
    all: ['donors'] as const,
    detail: (id: string) => ['donors', id] as const,
  },
  donations: {
    all: ['donations'] as const,
    detail: (id: string) => ['donations', id] as const,
  },
  donationCauses: {
    all: ['donation-causes'] as const,
    detail: (id: string) => ['donation-causes', id] as const,
  },
  constituencies: {
    all: ['constituencies'] as const,
    detail: (id: string) => ['constituencies', id] as const,
    subConstituencies: {
      all: ['constituencies', 'sub'] as const,
      detail: (id: string) => ['constituencies', 'sub', id] as const,
      byConstituency: (constituencyId: string) => ['constituencies', constituencyId, 'sub'] as const,
    }
  },
};
