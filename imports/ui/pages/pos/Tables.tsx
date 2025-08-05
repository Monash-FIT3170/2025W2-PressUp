import { Meteor } from "meteor/meteor";
import React, { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";



export const TablesPage = () => {
    const [_, setPageTitle] = usePageTitle();
    useEffect(() => {
        setPageTitle("POS System - Tables");
    }, [setPageTitle]);
    
    return (
        <div>
        </div>
    );
    }