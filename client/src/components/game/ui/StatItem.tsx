import React from "react";

interface StatItemProps {
    label: string;
    value: React.ReactNode;
    className?: string;
}

const StatItem = ({ label, value, className = "" }: StatItemProps) => {
    const classes = ["mt-4 w-full text-center bg-gray-100 rounded-md", className].filter(Boolean).join(" ");
    const normalizedLabel = (label || "").replace(/:/g, "").trim();
    let valueColor: string | undefined;
    if (normalizedLabel === "Available Moves") {
        valueColor = "var(--rvc-primary-yellow)";
    } else if (
        normalizedLabel === "Thinking Time" ||
        normalizedLabel === "Total Thinking" ||
        normalizedLabel === "Maximum Thinking"
    ) {
        valueColor = "var(--rvc-primary-blue)";
    } else if (normalizedLabel === "Code Return Value") {
        valueColor = "var(--rvc-primary-purple)";
    }
    return (
        <div className={classes}>
            <div>{label}</div>
            <div className="font-bold" style={valueColor ? { color: valueColor } : undefined}>{value}</div>
        </div>
    );
};

export default StatItem;
