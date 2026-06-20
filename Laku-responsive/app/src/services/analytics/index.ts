// Service analytics/telemetry (scaffolding). Belum ada provider analytics.
// Tempat aman untuk membungkus event tracking (mis. checkout, login) nanti.
export const analyticsService = {
  track: (event: string, props?: Record<string, unknown>) => {
    // no-op sampai provider analytics dipasang
    void event;
    void props;
  },
};
