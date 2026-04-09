import React, { useState, useEffect, useRef } from "react";
import { fetchDocuments, replaceDocument } from "../../services/backendApi";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  Button,
  TableSortLabel,
  Typography,
  Box,
  Pagination,
} from "@mui/material";
import { Link } from "react-router-dom";

function ChangeHistoryTableSuper() {
  const [records, setRecords] = useState([]);
  const [currentVal, setCurrentVal] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const searchTimeoutRef = useRef(null);

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  // Fetch records with pagination and search
  const fetchRecords = async (pageNum = 1, searchQuery = "") => {
    setIsLoading(true);
    try {
      const response = await fetchDocuments({
        collectionName: "history",
        condition: { isVerification: 2 },
        projection: {},
        searchText: searchQuery,
        page: pageNum,
        pageSize: pageSize,
      });

      console.log("Fetched response:", response);
      const data = Array.isArray(response.data) ? response.data : [];
      setRecords(data);
      setTotalRecords(response.totalRecords || data.length);
    } catch (error) {
      console.error("Error fetching records:", error);
      setRecords([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchRecords(1, "");
  }, []);

  // Re-fetch when page changes
  useEffect(() => {
    if (page > 1) {
      fetchRecords(page, searchText);
    }
  }, [page]);

  // Handle sorting (frontend-only for now)
  const handleSort = (key) => {
    const newDirection =
      sortConfig.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction: newDirection });

    const sortedRecords = [...records].sort((a, b) => {
      if (a[key] < b[key]) return newDirection === "asc" ? -1 : 1;
      if (a[key] > b[key]) return newDirection === "asc" ? 1 : -1;
      return 0;
    });

    setRecords(sortedRecords);
  };

  // Handle search with debouncing (backend search)
  const handleSearch = (e) => {
    const text = e.target.value;
    setSearchText(text);
    setPage(1); // Reset to page 1 on search

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the search request
    searchTimeoutRef.current = setTimeout(() => {
      fetchRecords(1, text);
    }, 500);
  };

  // Handle Save button click
  const handleAccept = async (recordId, isVerified, rejectionReason) => {
    const record = records.find((r) => r._id === recordId);
    if (!record) return;

    try {
      // Update the record in the database
      await replaceDocument({
        collectionName: "history",
        condition: { _id: recordId },
        data: {
          ...record,
          isVerification: currentVal + 1,
          rejectionReason: isVerified ? null : rejectionReason,
        },
      });

      console.log("Record updated successfully", record);
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Policy Verification - Level 3 (Super Admin)
      </Typography>

      {/* Search Input */}
      <TextField
        label="Search by Entity ID or Details"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchText}
        onChange={handleSearch}
        disabled={isLoading}
        placeholder="Search..."
      />

      {/* Pagination Info */}
      <Box sx={{ my: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="body2">
          Showing {records.length > 0 ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, totalRecords)} of {totalRecords} records
        </Typography>
        <Typography variant="body2">Page {page} of {totalPages}</Typography>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "entityId"}
                  direction={
                    sortConfig.key === "entityId" ? sortConfig.direction : "asc"
                  }
                  onClick={() => handleSort("entityId")}
                >
                  Data ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "fieldChanged"}
                  direction={
                    sortConfig.key === "fieldChanged"
                      ? sortConfig.direction
                      : "asc"
                  }
                  onClick={() => handleSort("fieldChanged")}
                >
                  Details
                </TableSortLabel>
              </TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Reason for Rejection</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>Loading...</Typography>
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>No records found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record._id} hover>
                  <TableCell>
                    <Link
                      to={`/dashboard/${record.entityType}s/${record.entityType}profile`}
                      state={{ name: record.fieldChanged, id: record.entityId }}
                    >
                      {record.entityId}
                    </Link>
                  </TableCell>
                  <TableCell>{record.fieldChanged}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={record.isVerification || false}
                      onChange={(e) =>
                        setRecords(
                          records.map((r) =>
                            r._id === record._id
                              ? { ...r, isVerification: e.target.checked }
                              : r
                          )
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      placeholder="Reason (if rejected)"
                      size="small"
                      disabled={record.isVerification}
                      value={record.rejectionReason || ""}
                      onChange={(e) =>
                        setRecords(
                          records.map((r) =>
                            r._id === record._id
                              ? { ...r, rejectionReason: e.target.value }
                              : r
                          )
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() =>
                        handleAccept(
                          record._id,
                          record.isVerification,
                          record.rejectionReason
                        )
                      }
                    >
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(event, value) => setPage(value)}
          disabled={isLoading}
          color="primary"
        />
      </Box>
    </div>
  );
}

export default ChangeHistoryTableSuper;
