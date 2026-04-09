import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Skeleton, Typography } from "@mui/material";
import { MdTrendingUp } from "react-icons/md";
import DashboardBox from "../Dashboard/DasboardBox";
import DataTable from "../../components/Datagrid/DataTable";
import { userdata } from "../Home/Signpage";
import { fetchDocuments } from "../../services/backendApi";

const formatCurrency = (value) => {
    const numeric = Number(value) || 0;
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(numeric);
};

const parseAmount = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value !== "string") {
        return 0;
    }

    const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
};

const Investments = () => {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);

    const columns = useMemo(
        () => [
            {
                field: "name",
                headerName: "Name",
                flex: 1.6,
                renderCell: (params) => (
                    <Link
                        to={params.row.entityType === "Startup" ? "/dashboard/startups/startupprofile" : "/dashboard/projects/projectprofile"}
                        state={{ name: params.row.name, id: params.row.entityId }}
                        style={{ textDecoration: "none", color: "#007BFF" }}
                    >
                        {params.row.name}
                    </Link>
                ),
            },
            { field: "entityType", headerName: "Type", flex: 0.9 },
            { field: "teamLead", headerName: "Owner", flex: 1.1 },
            { field: "status", headerName: "Status", flex: 1 },
            { field: "myInvestment", headerName: "My Investment", flex: 1.2 },
            { field: "totalFunding", headerName: "Total Funding", flex: 1.2 },
        ],
        []
    );

    useEffect(() => {
        const loadInvestments = async () => {
            setLoading(true);

            try {
                const [projectResponse, startupResponse] = await Promise.all([
                    fetchDocuments({
                        collectionName: "project",
                        condition: { "investors.email": userdata.email },
                        projection: {
                            _id: 1,
                            name: 1,
                            ownerName: 1,
                            status: 1,
                            funding: 1,
                            investors: 1,
                        },
                    }),
                    fetchDocuments({
                        collectionName: "startup",
                        condition: { "investors.email": userdata.email },
                        projection: {
                            _id: 1,
                            name: 1,
                            founder: 1,
                            level: 1,
                            funding: 1,
                            investors: 1,
                        },
                    }),
                ]);

                const projects = Array.isArray(projectResponse?.data) ? projectResponse.data : [];
                const startups = Array.isArray(startupResponse?.data) ? startupResponse.data : [];

                const nextRows = [
                    ...projects.map((project) => {
                        const investorEntry = Array.isArray(project?.investors)
                            ? project.investors.find(
                                (investor) =>
                                    String(investor?.email || "").trim().toLowerCase() ===
                                    String(userdata?.email || "").trim().toLowerCase()
                            )
                            : null;

                        return {
                            id: `project-${project._id}`,
                            entityId: project._id,
                            entityType: "Project",
                            name: project.name || "Untitled",
                            teamLead: project.ownerName || "Not specified",
                            status: project.status || "N/A",
                            myInvestment: formatCurrency(parseAmount(investorEntry?.amount)),
                            totalFunding: formatCurrency(parseAmount(project.funding)),
                        };
                    }),
                    ...startups.map((startup) => {
                        const investorEntry = Array.isArray(startup?.investors)
                            ? startup.investors.find(
                                (investor) =>
                                    String(investor?.email || "").trim().toLowerCase() ===
                                    String(userdata?.email || "").trim().toLowerCase()
                            )
                            : null;

                        return {
                            id: `startup-${startup._id}`,
                            entityId: startup._id,
                            entityType: "Startup",
                            name: startup.name || "Untitled",
                            teamLead: startup.founder || "Not specified",
                            status: startup.level ? `Stage ${startup.level}` : "N/A",
                            myInvestment: formatCurrency(parseAmount(investorEntry?.amount)),
                            totalFunding: formatCurrency(parseAmount(startup.funding)),
                        };
                    }),
                ];

                setRows(nextRows);
            } catch (error) {
                console.error("Error fetching investor investments:", error);
                setRows([]);
            } finally {
                setLoading(false);
            }
        };

        loadInvestments();
    }, []);

    if (loading) {
        return (
            <div style={{ width: "100%" }}>
                <Skeleton animation="wave" width="100%" height="120px" />
                <Skeleton animation="wave" width="100%" height="420px" />
            </div>
        );
    }

    return (
        <div className="projectpage">
            <div className="projectTop">
                <div className="projectDash">
                    <span>Investments</span> <MdTrendingUp />
                </div>
                <div className="projectStats w-100">
                    <DashboardBox
                        valUser={{
                            text: "My Active Investments",
                            val: rows.length,
                            icon: <MdTrendingUp />,
                        }}
                        color={["#2c78ef", "#60aff5"]}
                    />
                </div>
            </div>

            {rows.length === 0 ? (
                <Box sx={{ px: 2, py: 4 }}>
                    <Typography variant="h6">No investments found yet.</Typography>
                    <Typography color="text.secondary">
                        Once you invest in projects or startups, they will appear here.
                    </Typography>
                </Box>
            ) : (
                <DataTable columns={columns} initialrows={rows} />
            )}
        </div>
    );
};

export default Investments;