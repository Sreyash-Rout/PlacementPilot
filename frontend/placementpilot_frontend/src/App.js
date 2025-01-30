import React, { useEffect, useState } from 'react';

const App = () => {
  const [backendData, setBackendData] = useState(null);

  useEffect(() => {
    fetch("/api")
      .then(response => response.json())
      .then(data => setBackendData(data))
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      {!backendData || !backendData.users ? (
        <p>Loading....</p>
      ) : (
        backendData.users.map((user, i) => (
          <p key={i}>{user}</p>
        ))
      )}
    </div>
  );
};

export default App;