import Sidebar from "../components/AddItemSidebar";

export const MenuPage = () => (
  <>
    <header className="header"></header>
    <main className="main" style={{ display: "flex", justifyContent: "flex-end" }}>
      <div>
        <Sidebar />
      </div>
    </main>
  </>
);