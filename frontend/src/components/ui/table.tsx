import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableProps {
  className?: string;
  children: ReactNode;
}

export function Table({ className, children }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  className?: string;
  children: ReactNode;
}

export function TableHeader({ className, children }: TableHeaderProps) {
  return <thead className={cn("[&_tr]:border-b", className)}>{children}</thead>;
}

interface TableBodyProps {
  className?: string;
  children: ReactNode;
}

export function TableBody({ className, children }: TableBodyProps) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)}>{children}</tbody>;
}

interface TableRowProps {
  className?: string;
  children: ReactNode;
}

export function TableRow({ className, children }: TableRowProps) {
  return (
    <tr className={cn("border-b transition-colors hover:bg-gray-50", className)}>
      {children}
    </tr>
  );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
  children: ReactNode;
}

export function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td className={cn("p-4 align-middle", className)} {...props}>
      {children}
    </td>
  );
}

interface TableHeadProps {
  className?: string;
  children: ReactNode;
}

export function TableHead({ className, children }: TableHeadProps) {
  return (
    <th className={cn("h-12 px-4 text-left align-middle font-medium text-gray-500", className)}>
      {children}
    </th>
  );
}
