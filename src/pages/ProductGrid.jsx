import React, { useEffect, useMemo, useState, useRef, useContext } from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AppContext from "../context/AppContext";
import { addToLocalCart } from "../utils/cartLocal";

export default function ProductGrid() {
  const navigate = useNavigate();
  const { cartItems } = useContext(AppContext) || {};

  const API_BASE = import.meta.env.VITE_API_BASE || "";
  const URL = API_BASE ? `${API_BASE}/cms/products` : `/api/cms/products`;

  // Grid & server state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState([]);
  const [serverRowCount, setServerRowCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filters & sorting
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortModel, setSortModel] = useState([{ field: "price", sort: "asc" }]);
  const [categories, setCategories] = useState([]);

  // Debounce refs
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // Debounce search, category, sort
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPage(0), 350);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [search, categoryFilter, sortModel]);

  // Fetch data
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          page: page + 1,
          limit: pageSize,
          search: search || undefined,
          category: categoryFilter || undefined,
          sortField: sortModel?.[0]?.field,
          sortOrder: sortModel?.[0]?.sort,
        };

        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

        const { data = {} } = await axios.get(URL, { params, signal: controller.signal });
        const items = data.products || data.items || data.results || [];
        const mapped = items.map((p) => ({
          id: p.id ?? p._id ?? p.sku_code,
          name: p.name || p.title || "",
          category: p.main_category || p.category || "Other",
          price: (p.mrp && typeof p.mrp === "object" ? p.mrp.mrp ?? p.mrp : p.mrp) || p.price || 0,
          image: p.images?.front || p.gs1_images?.front || p.image || "https://placehold.co/200x200",
          _raw: p,
        }));

        setRows(mapped);
        const total = Number(data.totalResults ?? data.total ?? data.totalCount ?? mapped.length);
        setServerRowCount(total);

        // derive categories from current page
        setCategories(Array.from(new Set(mapped.map((r) => r.category).filter(Boolean))));
      } catch (err) {
        if (!axios.isCancel?.(err)) {
          console.error("Fetch error:", err);
          setRows([]);
          setServerRowCount(0);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [page, pageSize, search, categoryFilter, sortModel, URL]);

  // Client-side fallback: search, category, sort
  const displayRows = useMemo(() => {
    let arr = [...rows];

    if (search) arr = arr.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter) arr = arr.filter((r) => r.category === categoryFilter);

    const sm = sortModel?.[0];
    if (sm?.field) {
      arr.sort((a, b) => {
        const va = a[sm.field], vb = b[sm.field];
        if (sm.field === "price") return sm.sort === "asc" ? va - vb : vb - va;
        return sm.sort === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
    }

    return arr;
  }, [rows, search, categoryFilter, sortModel]);

  // Columns
  const columns = useMemo(
    () => [
      {
        field: "product",
        headerName: "Product",
        flex: 1,
        sortable: false,
        renderCell: (params) => {
          const qty = cartItems?.[params.row.id] || 0;
          return (
            <Card
              sx={{ display: "flex", alignItems: "center", p: 1, cursor: "pointer", width: "100%" }}
              onClick={() => navigate(`/product-details/${params.row.id}`)}
            >
              <CardMedia
                component="img"
                image={params.row.image}
                alt={params.row.name}
                sx={{ width: 120, height: 120, objectFit: "contain", mr: 2 }}
              />
              <CardContent sx={{ p: 0, flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>{params.row.name}</Typography>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>₹{params.row.price}</Typography>
                <Typography variant="body2" color="text.secondary">Category: {params.row.category}</Typography>
              </CardContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, ml: 2 }}>
                {!qty ? (
                  <Button variant="contained" onClick={(e) => { e.stopPropagation(); addToLocalCart(params.row, 1); }}>
                    Add to cart
                  </Button>
                ) : (
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); addToLocalCart(params.row, -1); }}>-</Button>
                    <Typography>{qty}</Typography>
                    <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); addToLocalCart(params.row, 1); }}>+</Button>
                  </Box>
                )}
              </Box>
            </Card>
          );
        },
      },
      { field: "price", headerName: "Price (INR)", width: 140, type: "number", sortable: true, valueGetter: (params) => params.row.price },
    ],
    [navigate, cartItems]
  );

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField label="Search Product" variant="outlined" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 220 }} />
        <TextField select label="Filter by Category" value={categoryFilter} sx={{ width: "auto", minWidth: 150 }} onChange={(e) => setCategoryFilter(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
      </Box>

      {loading && rows.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>
      ) : (
        <DataGrid
          rows={displayRows}
          columns={columns}
          pagination
          paginationMode="server"
          sortingMode="server"
          page={page}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 20, 50]}
          rowCount={serverRowCount}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          getRowId={(row) => row.id}
          disableSelectionOnClick
          onRowClick={(params) => navigate(`/product-details/${params.row.id}`)}
          rowHeight={150}
          loading={loading}
          autoHeight={false}
        />
      )}
    </Box>
  );
}
