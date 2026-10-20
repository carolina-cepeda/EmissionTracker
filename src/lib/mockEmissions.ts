import type { Emission, EmissionError, NewEmission } from '../types/emission';

const LATENCY_MS = 350;

const HOUR = 60 * 60 * 1000;

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * HOUR).toISOString();
}

function seed(): Emission[] {
  return [
    {
      id: 'mock-1',
      source_name: 'Flota de reparto Madrid',
      category: 'Transporte',
      co2_kg: 1240.5,
      created_at: hoursAgo(2),
    },
    {
      id: 'mock-2',
      source_name: 'Consumo eléctrico oficinas',
      category: 'Energía',
      co2_kg: 3180.75,
      created_at: hoursAgo(6),
    },
    {
      id: 'mock-3',
      source_name: 'Camión de rutas Barcelona',
      category: 'Transporte',
      co2_kg: 875.2,
      created_at: hoursAgo(26),
    },
    {
      id: 'mock-4',
      source_name: 'Caldera de la planta de Valencia',
      category: 'Energía',
      co2_kg: 5402.1,
      created_at: hoursAgo(48),
    },
    {
      id: 'mock-5',
      source_name: 'Residuos orgánicos segregated',
      category: 'Residuos',
      co2_kg: 310.4,
      created_at: hoursAgo(72),
    },
    {
      id: 'mock-6',
      source_name: 'Almacén central Sevilla',
      category: 'Residuos',
      co2_kg: 96.8,
      created_at: hoursAgo(120),
    },
  ];
}

let store: Emission[] = seed();

function delay(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, LATENCY_MS);
  });
}

function mockError(message: string): EmissionError {
  return { kind: 'validation', message, scope: 'submit' };
}

export async function listEmissionsMock(): Promise<Emission[]> {
  await delay();
  return [...store].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function createEmissionMock(input: NewEmission): Promise<Emission> {
  await delay();

  // Regla de demo: un nombre con "error" simula el fallo del servidor.
  if (input.source_name.toLowerCase().includes('error')) {
    throw mockError(
      'No pudimos guardar la medición (error simulado del servidor). Inténtalo de nuevo.',
    );
  }

  const created: Emission = {
    id: `mock-${crypto.randomUUID()}`,
    source_name: input.source_name.trim(),
    category: input.category,
    co2_kg: input.co2_kg,
    created_at: new Date().toISOString(),
  };

  store = [created, ...store];
  return created;
}
