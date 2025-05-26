import React, {useState, useEffect, useRef } from 'react';

interface CategoryProps {
    selectedCategories: string[];
    onChange: (categories: string[]) => void;
    initialCategories?: string[];
}

export const CategoryDropdown: React.FC<CategoryProps> = ({ 
    selectedCategories, 
    onChange, 
    initialCategories = []
}) => { 
    const [allCategories, setAllcategories] = useState<string[]>(initialCategories);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [ searchCategory, setSearchCategory ] = useState("");

    const updatecategories = (category: string) => {
        if (selectedCategories.includes(category)) {
            onChange(selectedCategories.filter((item) => item !== category));
        } else {
            onChange([...selectedCategories, category]);
        }
    };

    const searchCategoryList = allCategories.filter(category =>
        category.toLowerCase().includes(searchCategory.toLowerCase())
    )

    const deleteCategory = (category: string | null) => {
        if (!category) return;

        setAllcategories((previous) => previous.filter((item) => item !== category));
        if (selectedCategories.includes(category)) {
            onChange(selectedCategories.filter((item) => item !== category));
        }
    };

    useEffect(() => { setSearchCategory(""); }, [ initialCategories, selectedCategories ]);

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
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="border rounded p-2 w-full"
                placeholder="--Search categories--"
                onFocus={() => setShowDropdown(true)}
            />
            { showDropdown && (
                // displaying the categories within dropdown
            <ul className="z-10 absolute bg-gray-50 border border-gray-300 text-red-900 text-sm rounded-lg focus:ring-red-900 focus:border-red-900 block w-full p-2.5 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white max-h-48 overflow-y-auto">
                {searchCategoryList.length > 0 ? (
                    searchCategoryList.map((category) => (
                        <li key={category} className="flex p-2 hover:bg-gray-200 rounded justify-between items-center">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(category)}
                                onChange={() => updatecategories(category)}
                            />
                            {category}
                        </label>
                        {/* for deleting a category */}
                        <button
                            type="button"
                            className="text-red-500 hover:bg-red-100 rounded-full w-5 h-5 flex items-center justify-center ml-4"
                            title="Delete category"
                            onClick={() => {
                                deleteCategory(category);
                            }}
                        >
                            x
                        </button>
                    </li>
                    ))
                ) : (
                    // for adding a category, if not found within search
                    <li className="p-2 text-sm text-gray-500">
                        <button
                            type="button"
                            onClick={() => { 
                                const trimInput = searchCategory.trim();
                                if ( 
                                    trimInput !== "" && !allCategories.includes(trimInput)
                                ) {
                                    const newCategory = trimInput.charAt(0).toUpperCase() + trimInput.slice(1);
                                    setAllcategories((previous) => [...previous, newCategory]);
                                    onChange([...selectedCategories, newCategory]);
                                    setSearchCategory("");
                                }
                            }} 
                            className="text-rose-500 hover:underline"
                        >
                        Add "{searchCategory}"
                        </button>
                    </li>
                )} 
                </ul>
            )}
        </div>
    );
}