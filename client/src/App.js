import React, {useEffect, useState} from 'react'

function App() {

  const [backendData, setBackendData] = useState([{}])

  useEffect(() => {
    fetch('/api')
      .then((response) => response.json())
      .then((data) => {
        setBackendData(data);
        console.log(data);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);


  return (
    <div>Hello World!</div>
  )
}

export default App