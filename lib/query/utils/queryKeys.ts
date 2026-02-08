export const queryKeys = {
  artisans: {
    all: ['artisans'] as const,
    detail: (id: string) => ['artisans', id] as const,
    users: {
      all: ['artisans', 'users'] as const,
      byArtisan: (artisanId: string) => ['artisans', 'users', artisanId] as const,
      create: ['artisans', 'users', 'create'] as const,
    },
    products: {
      byArtisan: (artisanId: string) => ['artisans', 'products', artisanId] as const,
    }
  },
};
