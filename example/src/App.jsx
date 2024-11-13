import { MeshGradientExample } from './shaders/mesh-gradient';
import { GrainCloudsExample } from './shaders/grain-clouds';
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
          </ul>
        </Route>

        <Route path="/mesh-gradient" component={MeshGradientExample} />
        <Route path="/grain-clouds" component={GrainCloudsExample} />
      </Switch>
    </Router>
  );
};

export default App;
