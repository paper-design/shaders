import { MeshGradientWithControls } from './shaders/mesh-gradient-example';
import { GrainCloudsWithControls } from './shaders/grain-clouds-example';
import { NeuroNoiseWithControls } from './shaders/neuro-noise-example';
import { Router, Switch, Route, Link } from 'wouter';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <h1>Paper Shaders examples</h1>

          <ul>
            <li>
              <Link href="/mesh-gradient">Mesh Gradient</Link>
            </li>
            <li>
              <Link href="/grain-clouds">Grain Clouds</Link>
            </li>
            <li>
              <Link href="/neuro-noise">Neuro Noise</Link>
            </li>
          </ul>
        </Route>

        <Route path="/mesh-gradient" component={MeshGradientWithControls}/>
        <Route path="/grain-clouds" component={GrainCloudsWithControls}/>
        <Route path="/neuro-noise" component={NeuroNoiseWithControls} />
      </Switch>
    </Router>
  );
};

export default App;
