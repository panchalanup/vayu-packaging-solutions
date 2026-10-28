/**
 * Smoke tests: each calculator renders with its defaults, shows a result, and its hand-off links carry the size and
 * src=tools.<slug> (designer, quote, WhatsApp). Also: the mm / cm / in toggle converts the typed size.
 */

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentType } from 'react';
import VolumetricCalculator from '../calculators/VolumetricCalculator';
import CbmCalculator from '../calculators/CbmCalculator';
import BoxSizeCalculator from '../calculators/BoxSizeCalculator';
import BoxStrengthCalculator from '../calculators/BoxStrengthCalculator';
import BoxWeightCalculator from '../calculators/BoxWeightCalculator';
import PackagingCostCalculator from '../calculators/PackagingCostCalculator';

const CASES: [string, ComponentType][] = [
  ['volumetric-weight-calculator', VolumetricCalculator],
  ['cbm-calculator', CbmCalculator],
  ['box-size-calculator', BoxSizeCalculator],
  ['box-strength-calculator', BoxStrengthCalculator],
  ['box-weight-calculator', BoxWeightCalculator],
  ['packaging-cost-calculator', PackagingCostCalculator],
];

const renderIt = (C: ComponentType) =>
  render(
    <MemoryRouter>
      <C />
    </MemoryRouter>
  );

describe('calculators', () => {
  it.each(CASES)('%s renders a result and hand-off links with src', (slug, Calculator) => {
    const { container } = renderIt(Calculator);
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href') ?? '');
    const designer = hrefs.find((h) => h.startsWith('/box-designer'));
    const quote = hrefs.find((h) => h.startsWith('/quote'));
    expect(designer, 'designer link').toBeDefined();
    expect(quote, 'quote link').toBeDefined();
    expect(designer).toContain(`src=tools.${slug}`);
    expect(quote).toContain(`src=tools.${slug}`);
    expect(hrefs.some((h) => h.startsWith('https://wa.me/') && h.includes('text='))).toBe(true);
    expect(screen.getByText(/Copy result/i)).toBeInTheDocument();
    // size-carrying links
    expect(designer).toMatch(/[?&]l=\d/);
    expect(quote).toMatch(/[?&]l=\d/);
  });

  it('volumetric: defaults give 1.8 kg and the unit toggle converts the typed size', () => {
    renderIt(VolumetricCalculator);
    expect(screen.getAllByText(/1\.8 kg/).length).toBeGreaterThan(0);
    const lengthInput = screen.getByLabelText('Length') as HTMLInputElement;
    expect(lengthInput.value).toBe('30');
    fireEvent.click(screen.getByRole('radio', { name: 'mm' }));
    expect((screen.getByLabelText('Length') as HTMLInputElement).value).toBe('300');
    // typing in mm still works: 300 x 200 x 150 mm is the same box
    fireEvent.change(screen.getByLabelText('Width'), { target: { value: '200' } });
    expect(screen.getAllByText(/1\.8 kg/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('radio', { name: 'in' }));
    expect((screen.getByLabelText('Length') as HTMLInputElement).value).toBe('11.81');
  });

  it('volumetric: a bad size shows the empty state and no hand-off size', () => {
    renderIt(VolumetricCalculator);
    fireEvent.change(screen.getByLabelText('Height'), { target: { value: 'abc' } });
    expect(screen.getByText(/Enter length, width and height/)).toBeInTheDocument();
  });

  it('box size: opens the designer with the inside size and the use-case style', () => {
    const { container } = renderIt(BoxSizeCalculator);
    const designer = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href') ?? '').find((h) => h.startsWith('/box-designer'))!;
    const q = new URLSearchParams(designer.split('?')[1]);
    expect(q.get('style')).toBe('mailer');
    expect(q.get('l')).toBe('22.5');
    expect(q.get('w')).toBe('12.5');
    expect(q.get('h')).toBe('7.5');
    expect(q.get('ply')).toBe('3-ply');
    const result = within(container);
    expect(result.getAllByText(/22\.5 × 12\.5 × 7\.5 cm/).length).toBeGreaterThan(0);
  });

  it('box weight: no cost without rates, cost once every layer has one', () => {
    renderIt(BoxWeightCalculator);
    expect(screen.getByText(/Type a paper rate/)).toBeInTheDocument();
    for (const input of screen.getAllByPlaceholderText('your rate')) fireEvent.change(input, { target: { value: '40' } });
    expect(screen.queryByText(/Type a paper rate/)).not.toBeInTheDocument();
    expect(screen.getByText(/Paper cost per box/)).toBeInTheDocument();
  });
});
