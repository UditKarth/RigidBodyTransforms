import { Sidebar } from './components/Sidebar'
import { Scene3D } from './components/Scene3D'

function App() {
  return (
    <div className="flex h-screen w-screen bg-slate-950">
      <main className="flex-1 min-w-0 flex flex-col">
        <Scene3D />
      </main>
      <Sidebar />
    </div>
  )
}

export default App
