import { MeshGradient } from "@paper-design/shaders-react";
import "./App.css";

const App = () => {
  return (
    <MeshGradient
      speed={0.25}
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

export default App
