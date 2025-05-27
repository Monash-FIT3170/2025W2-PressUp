import React, {useState, useEffect, useRef } from 'react';

interface IngredientProps {
    selectedIngredients: string[];
    onChange: (ingredients: string[]) => void;
    initialIngredients?: string[];
}

export const IngredientDropdown: React.FC<IngredientProps> = ({ 
    selectedIngredients, 
    onChange, 
    initialIngredients = []
}) => { 
    const [allIngredients, setAllIngredients] = useState<string[]>(initialIngredients);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [ searchIngredient, setSearchIngredient ] = useState("");

    const updateIngredients = (ingredient: string) => {
        if (selectedIngredients.includes(ingredient)) {
            onChange(selectedIngredients.filter((i) => i !== ingredient));
        } else {
            onChange([...selectedIngredients, ingredient]);
        }
    };

    const searchIngredientList = allIngredients.filter(ingredient =>
        ingredient.toLowerCase().includes(searchIngredient.toLowerCase())
    )

    const deleteIngredient = (ingredient: string | null) => {
        if (!ingredient) return;

        setAllIngredients((previous) => previous.filter((item) => item !== ingredient));
        if (selectedIngredients.includes(ingredient)) {
            onChange(selectedIngredients.filter((item) => item !== ingredient));
        }
    };

    useEffect(() => { setSearchIngredient(""); }, [ initialIngredients, selectedIngredients ]);

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
        <div className="relative" ref={containerRef}>
            <input
                type="text"
                value={searchIngredient}
                onChange={(e) => setSearchIngredient(e.target.value)}
                className="border rounded p-2 w-full"
                placeholder="--Search ingredients--"
                onFocus={() => setShowDropdown(true)}
            />
            { showDropdown && (
                // displaying the ingredients within dropdown
            <ul className="z-10 absolute bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white max-h-48 overflow-y-auto">
                {searchIngredientList.length > 0 ? (
                    searchIngredientList.map((ingredient) => (
                        <li key={ingredient} className="flex p-2 hover:bg-gray-200 rounded justify-between items-center">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedIngredients.includes(ingredient)}
                                onChange={() => updateIngredients(ingredient)}
                            />
                            {ingredient}
                        </label>
                        {/* for deleting an ingredient */}
                        <button
                            type="button"
                            className="text-red-500 hover:bg-red-100 rounded-full w-5 h-5 flex items-center justify-center ml-4"
                            title="Delete ingredient"
                            onClick={() => {
                                deleteIngredient(ingredient);
                            }}
                        >
                            x
                        </button>
                    </li>
                    ))
                ) : (
                    // for adding an ingredient, if not found within search
                    <li className="p-2 text-sm text-gray-500">
                        <button
                            type="button"
                            onClick={() => { 
                                const trimInput = searchIngredient.trim();
                                if ( 
                                    trimInput !== "" && !allIngredients.includes(trimInput)
                                ) {
                                    const newIngredient = trimInput.charAt(0).toUpperCase() + trimInput.slice(1);
                                    setAllIngredients((previous) => [...previous, newIngredient]);
                                    onChange([...selectedIngredients, newIngredient]);
                                    setSearchIngredient("");
                                }
                            }} 
                            className="text-press-up-purple hover:underline"
                        >
                        Add "{searchIngredient}"
                        </button>
                    </li>
                )} 
                </ul>
            )}
        </div>
    );
}