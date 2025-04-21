import React, { useEffect, useState } from "react";

function App() {
  const [backendData, setBackendData] = useState([{}]);

  useEffect(() => {
    fetch("/api")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setBackendData(data);
        console.log(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div
      data-theme="luxury"
      className="h-screen w-screen flex items-center justify-center"
    >
      <h1>Hello world!</h1>
    </div>
  );
}

export default App;
