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
                className="bg-press-up-purple border-2 border-press-up-purple text-white text-sm rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 block w-full p-2.5 placeholder-purple-200 dark:bg-press-up-purple dark:border-press-up-purple dark:placeholder-purple-200 dark:text-white dark:focus:ring-purple-400 dark:focus:border-purple-400"
                placeholder="--Search categories--"
                onFocus={() => setShowDropdown(true)}
            />
            { showDropdown && (
                // displaying the categories within dropdown
            <ul 
            style={{ backgroundColor: "var(--color-press-up-light-purple)" }}
            className="absolute z-50 border border-press-up-purple text-white text-sm rounded-lg p-2.5 max-h-48 overflow-y-auto w-full">                
            {searchCategoryList.length > 0 ? (
                    searchCategoryList.map((category) => (
                        <li key={category} className="flex p-2 hover:bg-press-up-purple-200 rounded justify-between items-center">
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
                    <li className="p-2 text-sm text-press-up-purple-500">
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
                            className="text-press-up-purple hover:underline"
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