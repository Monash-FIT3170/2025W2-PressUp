import React, { useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";

export const ProfitLossPage = () => {
    const [_, setPageTitle] = usePageTitle();
        useEffect(() => {
        setPageTitle("Finance - Profit Loss Page");
        }, [setPageTitle]);

    return (
        <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Profit & Loss Page</h1>
        <p className="text-gray-600">This is a blank page for testing purposes.</p>
        </div>
    );
}