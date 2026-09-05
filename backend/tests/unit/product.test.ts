import { buildProductEnum } from '../../src/utils/product';

describe('buildProductEnum', () => {
  it('normalizes identity fields and includes expiry', () => {
    expect(buildProductEnum('Basmati Rice', ' rice-01 ', 120, 6, 2027)).toBe(
      'basmati_rice_rice_01_120_6_2027',
    );
  });

  it('uses stable markers when expiry is absent', () => {
    expect(buildProductEnum('Milk', 'M-1', 50)).toBe('milk_m_1_50_na_na');
  });
});
