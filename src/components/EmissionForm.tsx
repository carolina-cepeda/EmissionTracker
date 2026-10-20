import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from './ui/Button';
import {
  EMISSION_CATEGORIES,
  type EmissionCategory,
  type EmissionFieldErrors,
  type NewEmission,
} from '../types/emission';
import { cn } from '../lib/cn';

interface EmissionFormProps {
  onSubmit: (values: NewEmission) => Promise<boolean>;
  submitting: boolean;
  errorMessage?: string | null;
}

interface FormValues {
  source_name: string;
  category: EmissionCategory | '';
  co2_kg: string;
}

const EMPTY_VALUES: FormValues = { source_name: '', category: '', co2_kg: '' };

const FIELD_LABELS: Record<keyof FormValues, string> = {
  source_name: 'Nombre de la fuente',
  category: 'Categoría',
  co2_kg: 'CO₂ producido (kg)',
};

function validate(values: FormValues): EmissionFieldErrors {
  const errors: EmissionFieldErrors = {};

  if (!values.source_name.trim()) {
    errors.source_name = 'Indica el nombre de la fuente de emisión.';
  } else if (values.source_name.trim().length > 120) {
    errors.source_name = 'El nombre no puede superar los 120 caracteres.';
  }

  if (!values.category) {
    errors.category = 'Selecciona una categoría.';
  }

  const parsed = Number(values.co2_kg.replace(',', '.'));
  if (!values.co2_kg.trim()) {
    errors.co2_kg = 'Introduce la cantidad de CO₂ producida.';
  } else if (!Number.isFinite(parsed)) {
    errors.co2_kg = 'El CO₂ debe ser un valor numérico.';
  } else if (parsed <= 0) {
    errors.co2_kg = 'El CO₂ debe ser mayor que 0.';
  }

  return errors;
}

export function EmissionForm({
  onSubmit,
  submitting,
  errorMessage,
}: EmissionFormProps) {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<EmissionFieldErrors>({});
  const formId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const co2Ref = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate(values);

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      const firstInvalid = (Object.keys(validation) as (keyof FormValues)[]).find(
        (key) => validation[key] !== undefined,
      );
      if (firstInvalid === 'source_name') nameRef.current?.focus();
      if (firstInvalid === 'category') categoryRef.current?.focus();
      if (firstInvalid === 'co2_kg') co2Ref.current?.focus();
      return;
    }

    const parsedCo2 = Number(values.co2_kg.replace(',', '.'));
    const succeeded = await onSubmit({
      source_name: values.source_name.trim(),
      category: values.category as EmissionCategory,
      co2_kg: parsedCo2,
    });

    if (succeeded) {
      setValues(EMPTY_VALUES);
      setErrors({});
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby={`${formId}-heading`}
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <h2 id={`${formId}-heading`} className="text-lg font-semibold text-slate-900">
        Añadir medición
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Registra una nueva fuente de emisión para actualizar el seguimiento.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor={`${formId}-source_name`}
            className="block text-sm font-medium text-slate-700"
          >
            {FIELD_LABELS.source_name}
          </label>
          <input
            id={`${formId}-source_name`}
            ref={nameRef}
            name="source_name"
            type="text"
            value={values.source_name}
            onChange={(event) => handleChange('source_name', event.target.value)}
            aria-invalid={Boolean(errors.source_name)}
            aria-describedby={errors.source_name ? `${formId}-source_name-error` : undefined}
            className={cn(
              'mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600',
              errors.source_name
                ? 'border-red-400 focus-visible:outline-red-500'
                : 'border-slate-300 focus-visible:outline-emerald-600',
            )}
            placeholder="Flota de reparto Madrid"
          />
          {errors.source_name && (
            <p
              id={`${formId}-source_name-error`}
              role="alert"
              className="mt-1 text-sm text-red-600"
            >
              {errors.source_name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`${formId}-category`}
            className="block text-sm font-medium text-slate-700"
          >
            {FIELD_LABELS.category}
          </label>
          <select
            id={`${formId}-category`}
            ref={categoryRef}
            name="category"
            value={values.category}
            onChange={(event) =>
              handleChange('category', event.target.value as EmissionCategory | '')
            }
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? `${formId}-category-error` : undefined}
            className={cn(
              'mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600',
              errors.category
                ? 'border-red-400 focus-visible:outline-red-500'
                : 'border-slate-300',
            )}
          >
            <option value="">Selecciona…</option>
            {EMISSION_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p
              id={`${formId}-category-error`}
              role="alert"
              className="mt-1 text-sm text-red-600"
            >
              {errors.category}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={`${formId}-co2_kg`}
            className="block text-sm font-medium text-slate-700"
          >
            {FIELD_LABELS.co2_kg}
          </label>
          <input
            id={`${formId}-co2_kg`}
            ref={co2Ref}
            name="co2_kg"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={values.co2_kg}
            onChange={(event) => handleChange('co2_kg', event.target.value)}
            aria-invalid={Boolean(errors.co2_kg)}
            aria-describedby={errors.co2_kg ? `${formId}-co2_kg-error` : undefined}
            className={cn(
              'mt-1 block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600',
              errors.co2_kg
                ? 'border-red-400 focus-visible:outline-red-500'
                : 'border-slate-300',
            )}
            placeholder="125.50"
          />
          {errors.co2_kg && (
            <p
              id={`${formId}-co2_kg-error`}
              role="alert"
              className="mt-1 text-sm text-red-600"
            >
              {errors.co2_kg}
            </p>
          )}
        </div>
      </div>

      <div aria-live="polite" className="mt-5">
        {errorMessage && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Añadir medición'}
        </Button>
        {submitting && (
          <span className="text-sm text-slate-500" role="status">
            Enviando datos…
          </span>
        )}
      </div>
    </form>
  );
}
