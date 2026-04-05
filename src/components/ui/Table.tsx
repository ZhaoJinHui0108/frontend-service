import React from 'react';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: Record<string, any>) => React.ReactNode;
}

export interface TableProps {
  columns: TableColumn[];
  data: Record<string, any>[];
  emptyText?: string;
  loading?: boolean;
}

export function Table({ columns, data, emptyText = '暂无数据', loading = false }: TableProps) {
  if (loading) {
    return (
      <div className="table-wrapper">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="empty-state">{emptyText}</div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, textAlign: col.align || 'left' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{ textAlign: col.align || 'left' }}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
