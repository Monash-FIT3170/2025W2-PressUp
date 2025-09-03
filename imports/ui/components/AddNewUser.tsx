import React from "react";

interface AddNewUserProps {
  onAddUser?: () => void;
  onRemoveUser?: () => void;
  onExportUserList?: () => void;
}

const AddNewUser: React.FC<AddNewUserProps> = ({
  onAddUser,
  onRemoveUser,
  onExportUserList,
}) => {
  // Common button style with the specified color (#a43375)
  const buttonStyle: React.CSSProperties = {
    backgroundColor: "#a43375",
    color: "white",
    border: "none",
    borderRadius: "25px",
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    margin: "0 8px 0 0",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // Container style to ensure buttons are next to each other
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#f2f2f2",
    borderRadius: "8px",
  };

  return (
    <div style={containerStyle}>
      <button style={buttonStyle} onClick={onAddUser}>
        <span style={{ marginRight: "4px" }}>+</span> Add New User
      </button>

      <button style={buttonStyle} onClick={onRemoveUser}>
        <span style={{ marginRight: "4px" }}>-</span> Remove User
      </button>

      <button style={buttonStyle} onClick={onExportUserList}>
        Export User List
      </button>
    </div>
  );
};

export default AddNewUser;
