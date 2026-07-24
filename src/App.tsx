import { RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { CurrentUserProvider } from './contexts/CurrentUserProvider'
import router from './routes'

function App() {
  return (
    <CurrentUserProvider>
      <RouterProvider router={router} />
    </CurrentUserProvider>
  )
}

export default App
