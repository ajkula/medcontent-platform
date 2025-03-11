'use client';

import { ReactNode } from 'react';
import { FieldValues, UseFormReturn, FieldErrors } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void;
  className?: string;
  children: ReactNode;
}

export function Form<T extends FieldValues>({
  form,
  onSubmit,
  className,
  children,
}: FormProps<T>) {
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn('space-y-6', className)}
    >
      {children}
    </form>
  );
}

interface FormFieldProps {
  name: string;
  label?: string;
  className?: string;
  children: ReactNode;
  description?: string;
  error?: string;
}

export function FormField({
  name,
  label,
  children,
  className,
  description,
  error,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      {children}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

interface FormErrorProps {
  errors?: FieldErrors;
}

export function FormError({ errors }: FormErrorProps) {
  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <div className="p-4 my-4 border border-red-300 rounded-md bg-red-50">
      <h3 className="font-medium text-red-800">
        Le formulaire contient des erreurs
      </h3>
      <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
        {Object.entries(errors).map(([field, error]) => (
          <li key={field}>
            {typeof error === 'string'
              ? error
              : error?.message?.toString() || 'Champ invalide'}
          </li>
        ))}
      </ul>
    </div>
  );
}
