function Message({ children, type = "info" }) {
  const role = type === "error" ? "alert" : "status";

  return (
    <p className={`message message--${type}`} role={role}>
      {children}
    </p>
  );
}

export default Message;
