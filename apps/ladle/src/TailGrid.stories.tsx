import { Story } from "@ladle/react";
import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TailGrid, ThemeProvider, ThemeToggle, ThemeSelector, useThemeContext, useTailGridQuery } from "@tailgrid/react";
import type { TailGridColumn, SortingState } from "@tailgrid/core";
import type { FetchParams, FetchResult } from "@tailgrid/react";
import { defineTheme } from "@tailgrid/core";

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ============================================
// DATA TYPES
// ============================================

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive" | "on-leave";
  salary: number;
  joinDate: string;
  performance: number;
  location: string;
}

// ============================================
// SAMPLE DATA - 25 realistic employees
// ============================================

const employees: Employee[] = [
  { id: 1, name: "Sarah Chen", email: "sarah.chen@company.com", department: "Engineering", role: "Senior Developer", status: "active", salary: 145000, joinDate: "2021-03-15", performance: 95, location: "San Francisco" },
  { id: 2, name: "Marcus Johnson", email: "marcus.j@company.com", department: "Engineering", role: "Tech Lead", status: "active", salary: 175000, joinDate: "2019-08-20", performance: 98, location: "New York" },
  { id: 3, name: "Emily Rodriguez", email: "emily.r@company.com", department: "Design", role: "UX Designer", status: "active", salary: 95000, joinDate: "2022-01-10", performance: 88, location: "Austin" },
  { id: 4, name: "James Wilson", email: "james.w@company.com", department: "Sales", role: "Account Executive", status: "active", salary: 85000, joinDate: "2022-06-01", performance: 92, location: "Chicago" },
  { id: 5, name: "Priya Patel", email: "priya.p@company.com", department: "Engineering", role: "DevOps Engineer", status: "on-leave", salary: 130000, joinDate: "2020-11-15", performance: 90, location: "Seattle" },
  { id: 6, name: "Michael Brown", email: "michael.b@company.com", department: "Marketing", role: "Marketing Manager", status: "active", salary: 110000, joinDate: "2021-04-20", performance: 85, location: "Los Angeles" },
  { id: 7, name: "Lisa Thompson", email: "lisa.t@company.com", department: "HR", role: "HR Director", status: "active", salary: 125000, joinDate: "2018-09-01", performance: 91, location: "Boston" },
  { id: 8, name: "David Kim", email: "david.k@company.com", department: "Engineering", role: "Junior Developer", status: "active", salary: 75000, joinDate: "2023-02-28", performance: 82, location: "Denver" },
  { id: 9, name: "Amanda Foster", email: "amanda.f@company.com", department: "Finance", role: "Financial Analyst", status: "active", salary: 95000, joinDate: "2021-07-12", performance: 87, location: "Miami" },
  { id: 10, name: "Robert Garcia", email: "robert.g@company.com", department: "Sales", role: "Sales Director", status: "active", salary: 155000, joinDate: "2017-03-05", performance: 94, location: "Phoenix" },
  { id: 11, name: "Jennifer Lee", email: "jennifer.l@company.com", department: "Engineering", role: "QA Engineer", status: "inactive", salary: 88000, joinDate: "2020-05-18", performance: 78, location: "Portland" },
  { id: 12, name: "Christopher Davis", email: "chris.d@company.com", department: "Product", role: "Product Manager", status: "active", salary: 140000, joinDate: "2019-12-01", performance: 93, location: "San Francisco" },
  { id: 13, name: "Michelle Wang", email: "michelle.w@company.com", department: "Design", role: "UI Designer", status: "active", salary: 92000, joinDate: "2022-03-15", performance: 89, location: "New York" },
  { id: 14, name: "Daniel Martinez", email: "daniel.m@company.com", department: "Engineering", role: "Backend Developer", status: "active", salary: 125000, joinDate: "2020-08-10", performance: 91, location: "Austin" },
  { id: 15, name: "Rachel Adams", email: "rachel.a@company.com", department: "Customer Success", role: "CS Manager", status: "on-leave", salary: 98000, joinDate: "2021-01-20", performance: 86, location: "Chicago" },
  { id: 16, name: "Kevin O'Brien", email: "kevin.o@company.com", department: "Engineering", role: "Frontend Developer", status: "active", salary: 115000, joinDate: "2021-06-15", performance: 88, location: "Seattle" },
  { id: 17, name: "Stephanie White", email: "stephanie.w@company.com", department: "Legal", role: "Legal Counsel", status: "active", salary: 165000, joinDate: "2019-04-10", performance: 92, location: "Boston" },
  { id: 18, name: "Andrew Taylor", email: "andrew.t@company.com", department: "Operations", role: "Operations Manager", status: "active", salary: 105000, joinDate: "2020-02-25", performance: 84, location: "Denver" },
  { id: 19, name: "Nicole Jackson", email: "nicole.j@company.com", department: "Marketing", role: "Content Strategist", status: "active", salary: 78000, joinDate: "2022-09-01", performance: 81, location: "Los Angeles" },
  { id: 20, name: "Brian Miller", email: "brian.m@company.com", department: "Engineering", role: "Data Engineer", status: "active", salary: 135000, joinDate: "2020-10-12", performance: 90, location: "San Francisco" },
  { id: 21, name: "Laura Scott", email: "laura.s@company.com", department: "Finance", role: "Controller", status: "active", salary: 145000, joinDate: "2018-06-20", performance: 95, location: "New York" },
  { id: 22, name: "Jason Clark", email: "jason.c@company.com", department: "Sales", role: "Sales Rep", status: "inactive", salary: 65000, joinDate: "2023-01-15", performance: 72, location: "Miami" },
  { id: 23, name: "Megan Turner", email: "megan.t@company.com", department: "HR", role: "Recruiter", status: "active", salary: 72000, joinDate: "2022-04-10", performance: 83, location: "Phoenix" },
  { id: 24, name: "Ryan Hughes", email: "ryan.h@company.com", department: "Engineering", role: "Security Engineer", status: "active", salary: 150000, joinDate: "2019-11-08", performance: 96, location: "Seattle" },
  { id: 25, name: "Christina Moore", email: "christina.m@company.com", department: "Product", role: "Product Designer", status: "active", salary: 118000, joinDate: "2021-08-25", performance: 89, location: "Portland" },
];

// ============================================
// CELL RENDERERS
// ============================================

const StatusBadge = ({ value }: { value: string }) => {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    active: { bg: "#dcfce7", color: "#166534", border: "#86efac" },
    inactive: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
    "on-leave": { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
  };
  const style = styles[value] || styles.active;
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "9999px",
      fontSize: "12px",
      fontWeight: 600,
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      textTransform: "capitalize",
    }}>
      {value.replace("-", " ")}
    </span>
  );
};

const PerformanceBadge = ({ value }: { value: number }) => {
  let color = "#166534";
  let bg = "#dcfce7";
  if (value < 80) { color = "#991b1b"; bg = "#fee2e2"; }
  else if (value < 90) { color = "#92400e"; bg = "#fef3c7"; }
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "13px",
      fontWeight: 600,
      background: bg,
      color: color,
    }}>
      {value}%
    </span>
  );
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ============================================
// COLUMN DEFINITIONS
// ============================================

const columns: TailGridColumn<Employee>[] = [
  { id: "name", header: "Name", accessorKey: "name", width: 160, minWidth: 120, maxWidth: 250 },
  { id: "email", header: "Email", accessorKey: "email", width: 220, minWidth: 150, maxWidth: 300 },
  { id: "department", header: "Department", accessorKey: "department", width: 130, minWidth: 100, maxWidth: 180 },
  { id: "role", header: "Role", accessorKey: "role", width: 150, minWidth: 100, maxWidth: 200 },
  { id: "status", header: "Status", accessorKey: "status", width: 110, minWidth: 100, maxWidth: 140, cell: ({ value }) => <StatusBadge value={value as string} /> },
  { id: "salary", header: "Salary", accessorKey: "salary", width: 120, minWidth: 100, maxWidth: 150, dataType: "number", cell: ({ value }) => formatCurrency(value as number) },
  { id: "joinDate", header: "Join Date", accessorKey: "joinDate", width: 120, minWidth: 100, maxWidth: 150, dataType: "date", cell: ({ value }) => formatDate(value as string) },
  { id: "performance", header: "Performance", accessorKey: "performance", width: 120, minWidth: 100, maxWidth: 150, dataType: "number", cell: ({ value }) => <PerformanceBadge value={value as number} /> },
  { id: "location", header: "Location", accessorKey: "location", width: 130, minWidth: 100, maxWidth: 180 },
];

// Smaller column set for compact demos
const compactColumns: TailGridColumn<Employee>[] = [
  { id: "name", header: "Name", accessorKey: "name", width: 160 },
  { id: "department", header: "Department", accessorKey: "department", width: 130 },
  { id: "role", header: "Role", accessorKey: "role", width: 150 },
  { id: "status", header: "Status", accessorKey: "status", width: 110, cell: ({ value }) => <StatusBadge value={value as string} /> },
  { id: "salary", header: "Salary", accessorKey: "salary", width: 120, dataType: "number", cell: ({ value }) => formatCurrency(value as number) },
];

// ============================================
// STORIES
// ============================================

export const Default: Story = () => (
  <TailGrid
    data={employees.slice(0, 10)}
    columns={compactColumns}
    getRowId={(row) => String(row.id)}
  />
);
Default.meta = { iframeHeight: 500 };

export const WithSorting: Story = () => (
  <TailGrid
    data={employees.slice(0, 15)}
    columns={compactColumns}
    enableSorting
    getRowId={(row) => String(row.id)}
  />
);
WithSorting.meta = { iframeHeight: 550 };

export const WithColumnFiltering: Story = () => (
  <TailGrid
    data={employees}
    columns={compactColumns}
    enableSorting
    enableFiltering
    getRowId={(row) => String(row.id)}
  />
);
WithColumnFiltering.meta = { iframeHeight: 600 };

export const WithGlobalSearch: Story = () => (
  <TailGrid
    data={employees}
    columns={compactColumns}
    enableGlobalFilter
    enableSorting
    getRowId={(row) => String(row.id)}
  />
);
WithGlobalSearch.meta = { iframeHeight: 600 };

export const WithPagination: Story = () => (
  <TailGrid
    data={employees}
    columns={compactColumns}
    enablePagination
    enableSorting
    pageSize={5}
    getRowId={(row) => String(row.id)}
  />
);
WithPagination.meta = { iframeHeight: 450 };

export const WithRowSelection: Story = () => (
  <TailGrid
    data={employees.slice(0, 10)}
    columns={compactColumns}
    enableRowSelection
    enableSorting
    getRowId={(row) => String(row.id)}
  />
);
WithRowSelection.meta = { iframeHeight: 500 };

export const WithColumnResizing: Story = () => (
  <TailGrid
    data={employees.slice(0, 10)}
    columns={compactColumns}
    enableColumnResizing
    enableSorting
    getRowId={(row) => String(row.id)}
  />
);
WithColumnResizing.meta = { iframeHeight: 500 };

export const FullFeatured: Story = () => (
  <TailGrid
    data={employees}
    columns={columns}
    enableSorting
    enableFiltering
    enableGlobalFilter
    enablePagination
    enableRowSelection
    enableColumnResizing
    pageSize={8}
    getRowId={(row) => String(row.id)}
  />
);
FullFeatured.meta = { iframeHeight: 650 };

export const DarkTheme: Story = () => (
  <div style={{ background: "#1f2937", padding: "1rem", borderRadius: "8px" }}>
    <TailGrid
      data={employees.slice(0, 10)}
      columns={compactColumns}
      theme="dark"
      enableSorting
      enableFiltering
      enablePagination
      pageSize={5}
      getRowId={(row) => String(row.id)}
    />
  </div>
);
DarkTheme.meta = { iframeHeight: 500 };

export const LargeDataset: Story = () => {
  // Generate 100 rows
  const largeData = Array.from({ length: 100 }, (_, i) => ({
    ...employees[i % employees.length],
    id: i + 1,
    name: `Employee ${i + 1}`,
    email: `employee${i + 1}@company.com`,
  }));
  return (
    <TailGrid
      data={largeData}
      columns={compactColumns}
      enableSorting
      enablePagination
      enableGlobalFilter
      pageSize={10}
      getRowId={(row) => String(row.id)}
    />
  );
};
LargeDataset.meta = { iframeHeight: 600 };

export const EmptyState: Story = () => (
  <TailGrid
    data={[]}
    columns={compactColumns}
    enableSorting
    getRowId={(row) => String(row.id)}
    emptyMessage="No employees found. Try adjusting your filters."
  />
);
EmptyState.meta = { iframeHeight: 300 };

export const LoadingState: Story = () => (
  <TailGrid
    data={employees.slice(0, 5)}
    columns={compactColumns}
    loading={true}
    getRowId={(row) => String(row.id)}
  />
);
LoadingState.meta = { iframeHeight: 350 };

export const MinimalColumns: Story = () => {
  const minimalCols: TailGridColumn<Employee>[] = [
    { id: "name", header: "Employee", accessorKey: "name" },
    { id: "department", header: "Dept", accessorKey: "department" },
    { id: "status", header: "Status", accessorKey: "status", cell: ({ value }) => <StatusBadge value={value as string} /> },
  ];
  return (
    <TailGrid
      data={employees.slice(0, 8)}
      columns={minimalCols}
      enableSorting
      getRowId={(row) => String(row.id)}
    />
  );
};
MinimalColumns.meta = { iframeHeight: 400 };

// ============================================
// THEME ENGINE STORIES
// ============================================

// Custom brand theme for demonstration
const brandTheme = defineTheme({
  name: "brand",
  mode: "light",
  colors: {
    bg: "#faf5ff",
    bgHover: "#f3e8ff",
    bgSelected: "#e9d5ff",
    border: "#d8b4fe",
    text: "#581c87",
    textSecondary: "#7c3aed",
    textMuted: "#a78bfa",
    primary: "#9333ea",
    primaryHover: "#7c3aed",
  },
});

const oceanTheme = defineTheme({
  name: "ocean",
  mode: "dark",
  colors: {
    bg: "#0c4a6e",
    bgHover: "#075985",
    bgSelected: "#0369a1",
    border: "#0284c7",
    text: "#f0f9ff",
    textSecondary: "#bae6fd",
    textMuted: "#7dd3fc",
    primary: "#38bdf8",
    primaryHover: "#0ea5e9",
  },
});

export const ThemeEngineDemo: Story = () => {
  return (
    <ThemeProvider initialTheme="light" autoApply>
      <div style={{ padding: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Theme Engine Demo</h3>
          <ThemeToggle />
        </div>
        <TailGrid
          data={employees.slice(0, 8)}
          columns={compactColumns}
          enableSorting
          enableFiltering
          getRowId={(row) => String(row.id)}
        />
      </div>
    </ThemeProvider>
  );
};
ThemeEngineDemo.meta = { iframeHeight: 500 };

export const ThemeSelectorDemo: Story = () => {
  return (
    <ThemeProvider initialTheme="light" autoApply>
      <div style={{ padding: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Theme Selector</h3>
          <ThemeSelector placeholder="Select theme..." />
        </div>
        <TailGrid
          data={employees.slice(0, 8)}
          columns={compactColumns}
          enableSorting
          enableFiltering
          getRowId={(row) => String(row.id)}
        />
      </div>
    </ThemeProvider>
  );
};
ThemeSelectorDemo.meta = { iframeHeight: 500 };

// Component that uses the theme context
const ThemedGridWithInfo = () => {
  const { themeName, isDarkMode, setTheme, availableThemes } = useThemeContext();

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        marginBottom: "1rem",
        padding: "1rem",
        background: isDarkMode ? "#374151" : "#f3f4f6",
        borderRadius: "8px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <strong>Current Theme:</strong> {themeName}
          <span style={{
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            background: isDarkMode ? "#1e40af" : "#dbeafe",
            color: isDarkMode ? "#93c5fd" : "#1e40af",
          }}>
            {isDarkMode ? "Dark Mode" : "Light Mode"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {availableThemes.map((name) => (
            <button
              key={name}
              onClick={() => setTheme(name)}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: name === themeName ? "2px solid #3b82f6" : "1px solid #d1d5db",
                background: name === themeName ? "#eff6ff" : "#fff",
                cursor: "pointer",
                fontWeight: name === themeName ? 600 : 400,
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <TailGrid
        data={employees.slice(0, 8)}
        columns={compactColumns}
        enableSorting
        enableFiltering
        enablePagination
        pageSize={5}
        getRowId={(row) => String(row.id)}
      />
    </div>
  );
};

export const ThemeContextDemo: Story = () => {
  return (
    <ThemeProvider initialTheme="light" autoApply>
      <ThemedGridWithInfo />
    </ThemeProvider>
  );
};
ThemeContextDemo.meta = { iframeHeight: 550 };

// Custom themes demonstration
const CustomThemeGrid = () => {
  const { setTheme, registerTheme, availableThemes, themeName } = useThemeContext();

  // Register custom themes on mount
  useState(() => {
    registerTheme("brand", brandTheme);
    registerTheme("ocean", oceanTheme);
  });

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ margin: "0 0 0.5rem 0" }}>Custom Themes</h3>
        <p style={{ margin: "0 0 1rem 0", color: "#6b7280", fontSize: "14px" }}>
          Register custom themes using defineTheme() and registerTheme()
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {availableThemes.map((name) => (
            <button
              key={name}
              onClick={() => setTheme(name)}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: name === themeName ? "2px solid #3b82f6" : "1px solid #d1d5db",
                background: name === themeName ? "#eff6ff" : "#fff",
                cursor: "pointer",
                fontWeight: name === themeName ? 600 : 400,
                textTransform: "capitalize",
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <TailGrid
        data={employees.slice(0, 10)}
        columns={compactColumns}
        enableSorting
        enableFiltering
        enableRowSelection
        getRowId={(row) => String(row.id)}
      />
    </div>
  );
};

export const CustomThemesDemo: Story = () => {
  return (
    <ThemeProvider initialTheme="light" autoApply>
      <CustomThemeGrid />
    </ThemeProvider>
  );
};
CustomThemesDemo.meta = { iframeHeight: 550 };

export const SystemPreferenceDemo: Story = () => {
  return (
    <ThemeProvider initialTheme="light" autoApply respectSystemPreference>
      <div style={{ padding: "1rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h3 style={{ margin: "0 0 0.5rem 0" }}>System Preference</h3>
          <p style={{ margin: "0 0 1rem 0", color: "#6b7280", fontSize: "14px" }}>
            This grid respects your system's color scheme preference (light/dark mode).
            Change your system settings to see it update automatically.
          </p>
          <ThemeToggle lightLabel="☀️ Light" darkLabel="🌙 Dark" />
        </div>
        <TailGrid
          data={employees.slice(0, 8)}
          columns={compactColumns}
          enableSorting
          getRowId={(row) => String(row.id)}
        />
      </div>
    </ThemeProvider>
  );
};
SystemPreferenceDemo.meta = { iframeHeight: 500 };

// ============================================
// REMOTE PAGINATION DEMO
// ============================================

interface RemoteUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string };
}

const remoteUserColumns: TailGridColumn<RemoteUser>[] = [
  { id: "id", header: "ID", accessorKey: "id", width: 60 },
  { id: "name", header: "Name", accessorKey: "name", width: 180 },
  { id: "email", header: "Email", accessorKey: "email", width: 220 },
  { id: "phone", header: "Phone", accessorKey: "phone", width: 160 },
  { id: "website", header: "Website", accessorKey: "website", width: 140 },
  {
    id: "company",
    header: "Company",
    accessorFn: (row) => row.company?.name || "",
    width: 180,
  },
];

// Fetch function for JSONPlaceholder API
const fetchUsers = async (params: FetchParams): Promise<FetchResult<RemoteUser>> => {
  const url = new URL("https://jsonplaceholder.typicode.com/users");
  url.searchParams.set("_page", String(params.page));
  url.searchParams.set("_limit", String(params.pageSize));

  // Add sorting if present
  if (params.sorting.length > 0) {
    url.searchParams.set("_sort", params.sorting[0].id);
    url.searchParams.set("_order", params.sorting[0].desc ? "desc" : "asc");
  }

  const res = await fetch(url.toString());
  const users = await res.json();

  return {
    data: users,
    total: 10, // JSONPlaceholder has 10 users
  };
};

// Inner component that uses TanStack Query hooks
const RemotePaginationInner = () => {
  const {
    data,
    isLoading,
    isFetching,
    error,
    totalRows,
    totalPages,
    page,
    pageSize,
    setPage,
    setPageSize,
    canPreviousPage,
    canNextPage,
    previousPage,
    nextPage,
  } = useTailGridQuery<RemoteUser>({
    queryKey: "users",
    fetchFn: fetchUsers,
    pageSize: 5,
  });

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#dc2626" }}>
        Error loading data: {error.message}
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ margin: "0 0 0.5rem 0" }}>
          Remote Pagination with TanStack Query
          {isFetching && !isLoading && (
            <span style={{ marginLeft: "0.5rem", fontSize: "12px", color: "#6b7280" }}>
              (updating...)
            </span>
          )}
        </h3>
        <p style={{ margin: "0 0 1rem 0", color: "#6b7280", fontSize: "14px" }}>
          Data is fetched from JSONPlaceholder API with server-side pagination.
          Uses <code>useTailGridQuery</code> hook powered by TanStack Query for caching and smooth UX.
        </p>
      </div>

      <TailGrid
        data={data}
        columns={remoteUserColumns}
        loading={isLoading}
        getRowId={(row) => String(row.id)}
        enableSorting
      />

      {/* Pagination Controls */}
      {!isLoading && data.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem 1rem",
            borderTop: "1px solid #e5e7eb",
            background: "#f9fafb",
            marginTop: "-1px",
          }}
        >
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalRows)} of {totalRows} users
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              onClick={previousPage}
              disabled={!canPreviousPage}
              style={{
                padding: "6px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                background: !canPreviousPage ? "#f3f4f6" : "#fff",
                cursor: !canPreviousPage ? "not-allowed" : "pointer",
                opacity: !canPreviousPage ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: "14px" }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={!canNextPage}
              style={{
                padding: "6px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                background: !canNextPage ? "#f3f4f6" : "#fff",
                cursor: !canNextPage ? "not-allowed" : "pointer",
                opacity: !canNextPage ? 0.5 : 1,
              }}
            >
              Next
            </button>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{
                padding: "6px 8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                background: "#fff",
              }}
            >
              {[5, 10].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export const RemotePaginationDemo: Story = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RemotePaginationInner />
    </QueryClientProvider>
  );
};
RemotePaginationDemo.meta = { iframeHeight: 550 };

// Remote Data with Sorting Demo
const RemoteDataWithSortingInner = () => {
  const {
    data,
    isLoading,
    isFetching,
    sorting,
    setSorting,
  } = useTailGridQuery<RemoteUser>({
    queryKey: "users-sorted",
    fetchFn: fetchUsers,
    pageSize: 10,
  });

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ margin: "0 0 0.5rem 0" }}>
          Remote Data with Sorting
          {isFetching && !isLoading && (
            <span style={{ marginLeft: "0.5rem", fontSize: "12px", color: "#6b7280" }}>
              (updating...)
            </span>
          )}
        </h3>
        <p style={{ margin: "0 0 1rem 0", color: "#6b7280", fontSize: "14px" }}>
          Click column headers to sort. Sorting is sent to the server.
          {sorting.length > 0 && (
            <span style={{ marginLeft: "0.5rem", color: "#3b82f6" }}>
              Sorted by: {sorting.map(s => `${s.id} (${s.desc ? 'desc' : 'asc'})`).join(', ')}
            </span>
          )}
        </p>
      </div>

      <TailGrid
        data={data}
        columns={remoteUserColumns}
        loading={isLoading}
        getRowId={(row) => String(row.id)}
        enableSorting
        onSortingChange={setSorting}
      />
    </div>
  );
};

export const RemoteDataWithSorting: Story = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RemoteDataWithSortingInner />
    </QueryClientProvider>
  );
};
RemoteDataWithSorting.meta = { iframeHeight: 500 };
