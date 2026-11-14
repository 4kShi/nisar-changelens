import { catalogUrl } from './contract';

export interface DataSource {
  catalogUrl: string;
  fetchImpl: typeof fetch;
  isFixture: boolean;
}

/**
 * Production: the published static catalog under BASE_URL.
 * Dev with VITE_USE_FIXTURE=1: a clearly watermarked fixture. The env flag is
 * statically replaced by Vite, so the fixture module is dropped from prod builds.
 */
export async function getDataSource(): Promise<DataSource> {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIXTURE === '1') {
    const { createFixtureSource } = await import('../dev-fixtures/fixture');
    return { ...createFixtureSource(), isFixture: true };
  }
  return { catalogUrl: catalogUrl(), fetchImpl: (...args) => fetch(...args), isFixture: false };
}
