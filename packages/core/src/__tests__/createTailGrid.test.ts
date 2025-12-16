import { describe, it, expect } from 'vitest';
import { createTailGrid } from '../createTailGrid';
import type { TailGridColumn } from '../types';

interface TestRow {
  id: string;
  name: string;
  age: number;
}

const testColumns: TailGridColumn<TestRow>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name' },
  { id: 'age', header: 'Age', accessorKey: 'age' },
];

const testData: TestRow[] = [
  { id: '1', name: 'Alice', age: 30 },
  { id: '2', name: 'Bob', age: 25 },
  { id: '3', name: 'Charlie', age: 35 },
];

describe('createTailGrid', () => {
  describe('initialization', () => {
    it('should create a grid instance with data and columns', () => {
      const grid = createTailGrid({
        data: testData,
        columns: testColumns,
      });

      expect(grid).toBeDefined();
      expect(grid.getRows()).toEqual(testData);
    });

    it('should return columns', () => {
      const grid = createTailGrid({
        data: testData,
        columns: testColumns,
      });

      expect(grid.getColumns()).toHaveLength(2);
    });
  });

  describe('sorting', () => {
    it('should set sorting state', () => {
      const grid = createTailGrid({
        data: testData,
        columns: testColumns,
        enableSorting: true,
      });

      grid.setSorting([{ id: 'age', desc: false }]);

      expect(grid.getSorting()).toHaveLength(1);
      expect(grid.getSorting()[0].id).toBe('age');
      expect(grid.getSorting()[0].desc).toBe(false);
    });

    it('should set descending sorting state', () => {
      const grid = createTailGrid({
        data: testData,
        columns: testColumns,
        enableSorting: true,
      });

      grid.setSorting([{ id: 'age', desc: true }]);

      expect(grid.getSorting()[0].desc).toBe(true);
    });

    it('should clear sorting', () => {
      const grid = createTailGrid({
        data: testData,
        columns: testColumns,
        enableSorting: true,
      });

      grid.setSorting([{ id: 'age', desc: false }]);
      grid.clearSorting();

      expect(grid.getSorting()).toHaveLength(0);
    });
  });

  describe('pagination', () => {
    it('should paginate data', () => {
      const grid = createTailGrid({
        data: testData,
        columns: testColumns,
        enablePagination: true,
        initialPagination: { pageIndex: 0, pageSize: 2 },
      });

      const paginated = grid.getPaginatedRows();
      expect(paginated).toHaveLength(2);
    });

    it('should navigate pages', () => {
      const grid = createTailGrid({
        data: testData,
        columns: testColumns,
        enablePagination: true,
        initialPagination: { pageIndex: 0, pageSize: 2 },
      });

      grid.nextPage();
      const info = grid.getPaginationInfo();

      expect(info.pageIndex).toBe(1);
    });

    it('should return pagination info', () => {
      const grid = createTailGrid({
        data: testData,
        columns: testColumns,
        enablePagination: true,
        initialPagination: { pageIndex: 0, pageSize: 2 },
      });

      const info = grid.getPaginationInfo();

      expect(info.pageCount).toBe(2);
      expect(info.totalRows).toBe(3);
      expect(info.canNextPage).toBe(true);
      expect(info.canPreviousPage).toBe(false);
    });
  });

  describe('selection', () => {
    it('should select rows', () => {
      const grid = createTailGrid({
        data: testData,
        columns: testColumns,
        enableRowSelection: true,
        getRowId: (row) => row.id,
      });

      grid.toggleRowSelection('1');
      const selected = grid.getSelectedRowIds();

      expect(selected).toContain('1');
    });

    it('should clear selection', () => {
      const grid = createTailGrid({
        data: testData,
        columns: testColumns,
        enableRowSelection: true,
        getRowId: (row) => row.id,
      });

      grid.toggleRowSelection('1');
      grid.clearSelection();

      expect(grid.getSelectedRowIds()).toHaveLength(0);
    });
  });
});
