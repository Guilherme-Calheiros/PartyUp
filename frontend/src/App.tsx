const API_URL = import.meta.env.VITE_API_URL;

function App() {

  async function checkServer() {
    try {
      const response = await fetch(`${API_URL}/health/db`);
      const data = await response.json();
      console.log("Resposta do servidor:", data);
    } catch (error) {
      console.error("Erro ao checar o servidor:", error);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold underline text-blue-800">
        Hello world!
      </h1>
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={checkServer}
      >
        Checar servidor
      </button>
    </>
  )
}

export default App
