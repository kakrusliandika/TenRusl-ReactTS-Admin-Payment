// src/test/components/ui/Table.test.tsx

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '../../../components/ui/Table'

describe('Table', () => {
  it('renders table headers correctly', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Age</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    const nameHeader = screen.getByRole('columnheader', { name: /name/i })
    const ageHeader = screen.getByRole('columnheader', { name: /age/i })

    expect(nameHeader).toBeInTheDocument()
    expect(ageHeader).toBeInTheDocument()
  })

  it('renders table rows and cells correctly', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Age</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bob</TableCell>
            <TableCell>25</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    // cek konten sel
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()

    // pastikan ada tabelnya
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})
