import React from "react";

// Simple test component to verify React is working
function AppMinimal() {
  return (
    <div style={{ 
      padding: "2rem", 
      fontFamily: "Arial, sans-serif",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh",
      color: "white"
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
          � Jamii Tourney v3
        </h1>
        <p style={{ fontSize: "1.5rem", marginBottom: "2rem", opacity: 0.9 }}>
          React App is Loading Successfully!
        </p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h3>System Status:</h3>
        <ul>
          <li>✅ React is working</li>
          <li>✅ Vite dev server is running</li>
          <li>✅ TypeScript compilation successful</li>
        </ul>
        <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Next Steps:</h3>
        <p>Once this loads successfully, we can gradually add back the full app components.</p>
      </div>
    </div>
  );
}

export default MinimalApp;