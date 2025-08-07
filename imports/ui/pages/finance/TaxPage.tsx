import React, { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { Meteor } from 'meteor/meteor'

export const TaxPage = () => {
    const [_, setPageTitle] = usePageTitle();

    useEffect(() => {
        setPageTitle("Finance - Tax Page");

        const fetchData = async () => {
            //fetch relevant data
        };
        fetchData();
    }, [setPageTitle]);
    return (
        <div className="w-full p-6 bg-gray-50 min-h-screen">
            {/* Finance Cards (adds one for each metric) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            </div>

            {/* Detail Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                </h2>
            </div>
            </div>
        </div>
    );
}