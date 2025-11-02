import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import type { DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { InputNumber } from "primereact/inputnumber";
import { OverlayPanel } from "primereact/overlaypanel";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import type { ApiResponse, Artwork } from "./types";

export default function ArtInstituteDataTable() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 12;

  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [showSelectionPanel, setShowSelectionPanel] = useState<boolean>(false);
  const [rowsToSelect, setRowsToSelect] = useState<number | null>(null);
  const overlayPanelRef = useRef<OverlayPanel>(null);

  const fetchArtworks = async (page: number) => {
    setLoading(true);
    try {
      const resp = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`
      );
      const json: ApiResponse = await resp.json();
      setArtworks(json.data);
      setTotalRecords(json.pagination.total);
    } catch (err) {
      console.error("Error fetching artworks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(currentPage);
  }, [currentPage]);

  const onPageChange = (event: DataTablePageEvent) => {
    const newPage = (event.page ?? 0) + 1;
    setCurrentPage(newPage);
  };

  const selectMultipleRows = async (count: number) => {
    if (count <= 0) return;

    const selected: Artwork[] = [];
    let remainingCount = count;
    let page = currentPage;

    while (remainingCount > 0) {
      const resp = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`
      );
      const json: ApiResponse = await resp.json();
      const pageData = json.data;

      const itemsToSelect = Math.min(remainingCount, pageData.length);
      selected.push(...pageData.slice(0, itemsToSelect));
      remainingCount -= itemsToSelect;

      if (remainingCount > 0) {
        page++;
      } else {
        break;
      }
    }

    setSelectedArtworks(selected);
    overlayPanelRef.current?.hide();
  };

  const handleSubmitRowSelection = () => {
    if (rowsToSelect && rowsToSelect > 0) {
      selectMultipleRows(rowsToSelect);
      setRowsToSelect(null);
    }
  };

  const titleHeaderTemplate = () => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <i
          className="pi pi-chevron-down"
          style={{ cursor: "pointer", fontSize: "0.875rem" }}
          onClick={(e) => overlayPanelRef.current?.toggle(e)}
        />
        <span>Title</span>
        <OverlayPanel ref={overlayPanelRef}>
          <div style={{ padding: "1rem", minWidth: "250px" }}>
            <h4 style={{ marginTop: 0, marginBottom: "1rem" }}>
              Select Number of Rows
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <InputNumber
                value={rowsToSelect}
                onValueChange={(e) => setRowsToSelect(e.value ?? null)}
                placeholder="Enter number of rows"
                min={1}
                max={totalRecords}
              />
              <Button
                label="Submit"
                onClick={handleSubmitRowSelection}
                disabled={!rowsToSelect}
              />
            </div>
          </div>
        </OverlayPanel>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Artworks</h2>
        <div>
          <Button
            label={showSelectionPanel ? "Hide Selected" : "Show Selected"}
            icon={
              showSelectionPanel ? "pi pi-chevron-up" : "pi pi-chevron-down"
            }
            onClick={() => setShowSelectionPanel(!showSelectionPanel)}
            disabled={selectedArtworks.length === 0}
          />
        </div>
      </div>

      {showSelectionPanel && (
        <div className="mb-4 border p-4 rounded">
          <strong>Selected IDs:</strong>{" "}
          {selectedArtworks.map((a) => a.id).join(", ")}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <ProgressSpinner />
        </div>
      ) : (
        <DataTable
          value={artworks}
          selectionMode="checkbox"
          selection={selectedArtworks}
          onSelectionChange={(e) => setSelectedArtworks(e.value as Artwork[])}
          dataKey="id"
          lazy
          paginator
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPage={onPageChange}
          first={(currentPage - 1) * rowsPerPage}
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3rem" }}
          ></Column>
          <Column
            field="title"
            header={titleHeaderTemplate}
            style={{ minWidth: "200px" }}
          ></Column>
          <Column
            field="place_of_origin"
            header="Origin"
            style={{ minWidth: "150px" }}
          ></Column>
          <Column
            field="artist_display"
            header="Artist"
            style={{ minWidth: "200px" }}
          ></Column>
          <Column
            field="inscriptions"
            header="Inscriptions"
            style={{ minWidth: "150px" }}
          ></Column>
          <Column
            field="date_start"
            header="Start Date"
            style={{ minWidth: "100px" }}
          ></Column>
          <Column
            field="date_end"
            header="End Date"
            style={{ minWidth: "100px" }}
          ></Column>
        </DataTable>
      )}
    </div>
  );
}
