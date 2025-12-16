import type { Meta, StoryObj } from '@storybook/react';
import { TailGrid } from '@tailgrid/react';
import type { TailGridColumn } from '@tailgrid/react';

// Sample data types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
  salary: number;
}

// Sample data
const sampleUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', createdAt: '2024-01-15', salary: 85000 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'active', createdAt: '2024-02-20', salary: 72000 },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'inactive', createdAt: '2024-03-10', salary: 55000 },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Editor', status: 'active', createdAt: '2024-04-05', salary: 68000 },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin', status: 'active', createdAt: '2024-05-12', salary: 92000 },
  { id: '6', name: 'Diana Lee', email: 'diana@example.com', role: 'Viewer', status: 'inactive', createdAt: '2024-06-18', salary: 48000 },
  { id: '7', name: 'Edward Kim', email: 'edward@example.com', role: 'Editor', status: 'active', createdAt: '2024-07-22', salary: 75000 },
  { id: '8', name: 'Fiona Garcia', email: 'fiona@example.com', role: 'Admin', status: 'active', createdAt: '2024-08-30', salary: 88000 },
];

// Column definitions
const columns: TailGridColumn<User>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name', enableSorting: true, dataType: 'string' },
  { id: 'email', header: 'Email', accessorKey: 'email', enableSorting: true, dataType: 'string' },
  { id: 'role', header: 'Role', accessorKey: 'role', enableSorting: true, dataType: 'string' },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ value }) => (
      <span style={{
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 500,
        background: value === 'active' ? '#dcfce7' : '#fee2e2',
        color: value === 'active' ? '#166534' : '#991b1b',
      }}>
        {value as string}
      </span>
    ),
  },
  { id: 'salary', header: 'Salary', accessorKey: 'salary', enableSorting: true, dataType: 'currency',
    cell: ({ value }) => `$${(value as number).toLocaleString()}`,
  },
  { id: 'createdAt', header: 'Created', accessorKey: 'createdAt', enableSorting: true, dataType: 'date' },
];

const meta: Meta<typeof TailGrid<User>> = {
  title: 'Components/TailGrid',
  component: TailGrid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'TailGrid is an AI-native data grid component built on TanStack Table.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    enableSorting: {
      control: 'boolean',
      description: 'Enable column sorting',
    },
    enableFiltering: {
      control: 'boolean',
      description: 'Enable column filtering',
    },
    enablePagination: {
      control: 'boolean',
      description: 'Enable pagination',
    },
    enableRowSelection: {
      control: 'boolean',
      description: 'Enable row selection',
    },
    enableGlobalFilter: {
      control: 'boolean',
      description: 'Enable global search',
    },
    enableColumnResizing: {
      control: 'boolean',
      description: 'Enable column resizing',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic TailGrid with default settings
 */
export const Default: Story = {
  args: {
    data: sampleUsers,
    columns: columns,
  },
};

/**
 * TailGrid with sorting enabled
 */
export const WithSorting: Story = {
  args: {
    data: sampleUsers,
    columns: columns,
    enableSorting: true,
  },
};

/**
 * TailGrid with pagination
 */
export const WithPagination: Story = {
  args: {
    data: sampleUsers,
    columns: columns,
    enablePagination: true,
    initialPagination: { pageIndex: 0, pageSize: 5 },
    pageSizeOptions: [5, 10, 20],
  },
};

/**
 * TailGrid with row selection
 */
export const WithSelection: Story = {
  args: {
    data: sampleUsers,
    columns: columns,
    enableRowSelection: true,
    enableMultiRowSelection: true,
  },
};

/**
 * TailGrid with global search
 */
export const WithGlobalSearch: Story = {
  args: {
    data: sampleUsers,
    columns: columns,
    enableGlobalFilter: true,
  },
};

/**
 * TailGrid with column resizing
 */
export const WithColumnResizing: Story = {
  args: {
    data: sampleUsers,
    columns: columns,
    enableColumnResizing: true,
  },
};

/**
 * TailGrid with all features enabled
 */
export const FullFeatured: Story = {
  args: {
    data: sampleUsers,
    columns: columns,
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableGlobalFilter: true,
    enableColumnResizing: true,
    initialPagination: { pageIndex: 0, pageSize: 5 },
    pageSizeOptions: [5, 10, 20, 50],
  },
};

/**
 * TailGrid with loading state
 */
export const Loading: Story = {
  args: {
    data: [],
    columns: columns,
    loading: true,
  },
};

/**
 * TailGrid with empty state
 */
export const Empty: Story = {
  args: {
    data: [],
    columns: columns,
    emptyMessage: 'No users found. Try adjusting your filters.',
  },
};
