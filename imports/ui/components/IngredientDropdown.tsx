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

    const updateIngredients = (ingredient: string) => {
        if (selectedIngredients.includes(ingredient)) {
            onChange(selectedIngredients.filter((i) => i !== ingredient));
        } else {
            onChange([...selectedIngredients, ingredient]);
        }
    };

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
                className="border rounded p-2 w-full"
                placeholder="--Search ingredients--"
                onFocus={() => setShowDropdown(true)}
            />
            { showDropdown && (
            <ul className="absolute bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white z-10">
                {allIngredients.map((ingredient) => (
                    <li key={ingredient} className="p-2 hover:bg-gray-200">
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedIngredients.includes(ingredient)}
                                onChange={() => updateIngredients(ingredient)}
                            />
                            {ingredient}
                        </label>
                    </li>
                ))}
            </ul>
            )}
        </div>
    );
}