import React, { useEffect, useState } from "react";
import LandingPage from "./LandingPage/LandingPage";
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

  return <LandingPage />;
}

export default App;
