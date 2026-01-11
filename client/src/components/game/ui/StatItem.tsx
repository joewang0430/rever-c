import React from "react";

interface StatItemProps {
    label: string;
    value: React.ReactNode;
    className?: string;
}

const StatItem = ({ label, value, className = "" }: StatItemProps) => {
    const classes = ["mt-4 w-full text-center bg-gray-100 rounded-md", className].filter(Boolean).join(" ");
    return (
        <div className={classes}>
            <div>{label}</div>
            <div className="font-bold">{value}</div>
        </div>
    );
};

export default StatItem;
