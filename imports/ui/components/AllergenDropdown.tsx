import React, {useState, useEffect, useRef } from 'react';
import { ConfirmModal } from './ConfirmModal';

interface AllergenProps {
    selectedAllergen: string[];
    onChange: (allergens: string[]) => void;
    initialAllergens?: string[];
}

export const AllergenDropdown = ({
    selectedAllergen,
    onChange,
    initialAllergens = []
}: AllergenProps) => {

    const [allAllergens, setAllAllergens] = useState<string[]>(initialAllergens);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [ searchAllergen, setSearchAllergen ] = useState("");
    const [ showConfirmation, setShowConfirmation ] = useState(false);
    const [ allergenDelete, setAllergenDelete ] = useState<string | null>(null)

    const updateAllergens = (allergen: string) => {
        if (selectedAllergen.includes(allergen)) {
            onChange(selectedAllergen.filter((item) => item !== allergen));
        } else {
            onChange([...selectedAllergen, allergen]);
        }
    };

    const searchAllergenList = allAllergens.filter(allergen =>
        allergen.toLowerCase().includes(searchAllergen.toLowerCase())
    )

    const deleteAllergen = (allergen: string | null) => {
        if (!allergen) return;

        setAllAllergens((previous) => previous.filter((item) => item !== allergen));
        if (selectedAllergen.includes(allergen)) {
            onChange(selectedAllergen.filter((item) => item !== allergen));
        }
    };

    useEffect(() => { setSearchAllergen(""); }, [ initialAllergens, selectedAllergen ]);

    // to close dropdown with an outside click
    useEffect(() => {
        const handleClickToClose = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickToClose);
        return () => {
            document.removeEventListener("mousedown", handleClickToClose);
        };
    }, []);

    return (
        <>
        <div className="relative" ref={containerRef}>
            <input
                type="text"
                value={searchAllergen}
                onChange={(e) => setSearchAllergen(e.target.value)}
                className="border rounded p-2 w-full placeholder-white"
                placeholder="--Search allergens--"
                onFocus={() => setShowDropdown(true)}
            />
            { showDropdown && (
                // displaying the allergens within dropdown
            <ul className="z-10 absolute bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white max-h-48 overflow-y-auto">
                {searchAllergenList.length > 0 ? (
                    searchAllergenList.map((allergen) => (
                        <li key={allergen} className="flex p-2 hover:bg-gray-200 rounded justify-between items-center">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedAllergen.includes(allergen)}
                                onChange={() => updateAllergens(allergen)}
                            />
                            {allergen}
                        </label>
                        {/* for deleting a allergen */}
                        <button
                            type="button"
                            className="text-red-500 hover:bg-red-100 rounded-full w-5 h-5 flex items-center justify-center ml-4"
                            title="Delete allergen"
                            onClick={() => {
                                setShowConfirmation(true);
                                setAllergenDelete(allergen);
                            }}
                        >
                            x
                        </button>
                    </li>
                    ))
                ) : (
                    // for adding a allergen, if not found within search
                    <li className="p-2 text-sm text-gray-500">
                        <button
                            type="button"
                            onClick={() => { 
                                const trimInput = searchAllergen.trim();
                                if ( 
                                    trimInput !== "" && !allAllergens.includes(trimInput)
                                ) {
                                    const newAllergen = trimInput.charAt(0).toUpperCase() + trimInput.slice(1);
                                    setAllAllergens((previous) => [...previous, newAllergen]);
                                    onChange([...selectedAllergen, newAllergen]);
                                    setSearchAllergen("");
                                }
                            }} 
                            className="text-rose-500 hover:underline"
                        >
                        Add "{searchAllergen}"
                        </button>
                    </li>
                )} 
                </ul>
            )}
        </div>
        <ConfirmModal
                open={showConfirmation}
                message="Are you sure you want to delete this allergen?"

                onConfirm={() => {
                    deleteAllergen(allergenDelete);
                    setShowConfirmation(false);
                    }}
                onCancel={() =>{
                    setShowConfirmation(false);
                }}
            />
        </>
    );
}