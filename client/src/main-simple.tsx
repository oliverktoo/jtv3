import { createRoot } from "react-dom/client";

function SimpleApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎉 Frontend Working!</h1>
      <p>If you can see this, the React app is loading correctly.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<SimpleApp />);
} else {
  console.error("Root element not found!");
}