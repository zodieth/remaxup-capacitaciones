"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PlusCircle, Trash, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserManagement } from "./user-manage";
import { User } from "./user-manage";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const api = {
  fetchUsers: async () => {
    const response = await fetch("/api/user");
    if (!response.ok) {
      throw new Error("Error al cargar los usuarios");
    }
    return response.json();
  },
};

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [selectedUser, setSelectedUser] = useState<
    User | undefined
  >(undefined);
  const [users, setUsers] = useState<User[]>([]);

  console.log(selectedUser);
  useEffect(() => {
    api.fetchUsers().then(users => {
      setUsers(users);
    });
  }, []);

  const table = useReactTable({
    users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleToggleDropdown = () => {
    setIsDropdownOpen(prevState => !prevState);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsDropdownOpen(true);
  };

  const handleFormCancel = (isCanceled: boolean) => {
    setIsDropdownOpen(!isCanceled);
    isCanceled && setSelectedUser(undefined);
  };

  return (
    <div>
      <div className="flex items-center py-4 justify-between">
        <Input
          placeholder="Filtrar usuarios..."
          value={
            (table
              .getColumn("name")
              ?.getFilterValue() as string) ?? ""
          }
          onChange={event =>
            table
              .getColumn("name")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="relative">
          <Button onClick={() => setIsDropdownOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Crear usuario
          </Button>
          <div>
            {isDropdownOpen && (
              <UserManagement
                onCancel={handleFormCancel}
                user={selectedUser}
              />
            )}
          </div>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={
                    row.getIsSelected() && "seleccionado"
                  }
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleEditUser(row.original as User)
                        }
                        className="text-sm"
                      >
                        <Pencil className="h-4 w-4 " />
                      </Button>
                      {/* <ConfirmModal onConfirm={onDelete}> */}
                      <Button onClick={handleToggleDropdown}>
                        <Trash className="h-4 w-4" />
                      </Button>
                      {/* </ConfirmModal> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4 absolute bottom-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
