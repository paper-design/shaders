import { Router, Switch, Route, Link } from 'wouter';
import { MeshGradientWithControls } from './shaders/mesh-gradient-example';
import { GrainCloudsWithControls } from './shaders/grain-clouds-example';
import { NeuroNoiseWithControls } from './shaders/neuro-noise-example';
import { SmokeRingWithControls } from './shaders/smoke-ring-example';
import { SteppedSimplexNoiseWithControls } from './shaders/stepped-simplex-noise-example';

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
            <li>
              <Link href="/smoke-ring">Smoke Ring</Link>
            </li>
            <li>
              <Link href="/stepped-simplex-noise">Stepped Simplex Noise</Link>
            </li>
          </ul>
        </Route>

        <Route path="/mesh-gradient" component={MeshGradientWithControls} />
        <Route path="/grain-clouds" component={GrainCloudsWithControls} />
        <Route path="/neuro-noise" component={NeuroNoiseWithControls} />
        <Route path="/smoke-ring" component={SmokeRingWithControls} />
        <Route path="/stepped-simplex-noise" component={SteppedSimplexNoiseWithControls} />
      </Switch>
    </Router>
  );
};

export default App;
