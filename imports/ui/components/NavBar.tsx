import { useState } from "react";


export const NavBar = () => {

    const [isOpen, setIsOpen] = useState(true);

    const toggleMenu = () => {
      setIsOpen(!isOpen);
    };
  
    return (
      // Main Container
      <div className="flex h-screen">
        {/* Sidebar Navigation */}
        
        {/* Set colour to white,  */}
        <div className={` text-white w-64 transition-all duration-300 fixed h-20 z-10`}>
          <div className="p-4">
            {/* Hamburger Button */}
            <button onClick={toggleMenu} className="w-full flex justify-start mb-6">
              <div className="flex flex-col space-y-1">
                <div className="w-6 h-1 bg-rose-700"></div>
                <div className="w-6 h-1 bg-rose-700"></div>
                <div className="w-6 h-1 bg-rose-700"></div>
              </div>
            </button>
        </div>
        <div className={ `${isOpen ? 'block' : 'hidden'} bg-rose-400 h-screen`}>
            {/* Divider */}
            <div className="border-b border-rose-500 mb-2"></div>
  
            {/* Main Menu Items */}
            <ul className="space-y-1">
              {/* Finance Section */}
              <li className="mb-1">
                <div className="p-2 font-semibold flex items-center">
                  <span className="inline-block w-6 text-center mr-2">$</span>
                  <span>Finance</span>
                </div>
                <div className="border-b border-rose-500 mt-1 mb-1"></div>
              </li>
  
              {/* Finance Subitems */}
              <li className="pl-8 mb-1">
                <div className="p-1 flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Tax Management</span>
                </div>
              </li>
              <li className="pl-8 mb-1">
                <div className="p-1 flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Expense Tracking</span>
                </div>
              </li>
              <li className="pl-8 mb-1">
                <div className="p-1 flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>P/L Reporting</span>
                </div>
              </li>
  
              {/* Inventory Management */}
              <li className="mb-1">
                <div className="p-2 font-semibold flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </span>
                  <span>Inventory Management</span>
                </div>
                <div className="border-b border-rose-500 mt-1 mb-1"></div>
              </li>
  
              {/* Inventory Subitems */}
              <li className="pl-8 mb-1">
                <div className="p-1 flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </span>
                  <span>Suppliers</span>
                </div>
              </li>
              <li className="pl-8 mb-1">
                <div className="p-1 flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Stock</span>
                </div>
              </li>
  
              {/* POS System */}
              <li className="mb-1">
                <div className="p-2 font-semibold flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>POS System</span>
                </div>
                <div className="border-b border-rose-500 mt-1 mb-1"></div>
              </li>
  
              {/* POS Subitems */}
              <li className="pl-8 mb-1">
                <div className="p-1 flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </span>
                  <span>Orders</span>
                </div>
              </li>
              <li className="pl-8 mb-1">
                <div className="p-1 flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Tables</span>
                </div>
              </li>
  
              {/* Menu Management */}
              <li className="mb-1">
                <div className="p-2 font-semibold flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Menu Management</span>
                </div>
                <div className="border-b border-rose-500 mt-1 mb-1"></div>
              </li>
  
              {/* User Management */}
              <li className="mb-1">
                <div className="p-2 font-semibold flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>User Management</span>
                </div>
                <div className="border-b border-rose-500 mt-1 mb-1"></div>
              </li>
  
              {/* Staff Management */}
              <li className="mb-1">
                <div className="p-2 font-semibold flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </span>
                  <span>Staff Management</span>
                </div>
                <div className="border-b border-rose-500 mt-1 mb-1"></div>
              </li>
  
              {/* Staff Subitems */}
              <li className="pl-8 mb-1">
                <div className="p-1 flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Roster</span>
                </div>
              </li>
              <li className="pl-8 mb-1">
                <div className="p-1 flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Communication</span>
                </div>
              </li>
  
              {/* Kitchen Management */}
              <li className="mb-1">
                <div className="p-2 font-semibold flex items-center">
                  <span className="inline-block w-6 text-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Kitchen Management</span>
                </div>
                <div className="border-b border-rose-500 mt-1 mb-1"></div>
              </li>
            </ul>
          </div>
        </div>
        
        </div>
    
    );
  };


  export default NavBar
