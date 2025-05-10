// imports
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';

// ui components
import { MenuItem, MenuItemsCollection } from "../../../api/MenuItemsCollection";
import { PosItemCard } from "../../components/PosItemCard";
import { Modal } from '../../components/Modal';


export const MenuPage = () => {
    const isLoadingPosItems = useSubscribe("menuItems")
    const items = useTracker(() => MenuItemsCollection.find().fetch());
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);


    // useEffect(() => {
    //   Meteor.call('menuItems.getAll', (error: Meteor.Error | null, result: MenuItem[]) => {
    //     if (error) {
    //       console.error('Error fetching menu items:', error);
    //     } else {
    //       setMenuItems(result);
    //     }
    //   });
    // }, []);

    const handleEditItem = (itemId) => {
        //Meteor.call("menuItems.updateQuantity", itemId, 1);
        setIsEditModalOpen(true);
        console.log("click");
    };


    return (
        <>
            <header className="header"></header>
            <main className="main" style={{ display: "flex", justifyContent: "flex-end" }}>
                <div id="pos-display" className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                    {items.map((item) => (
                        <div className="min-w-[160px]">
                            <PosItemCard item={item} onClick={handleEditItem} />
                        </div>
                    ))}

                </div>
            </main>
            <Modal>isEditModalOpen</Modal>
        </>
    );
}
