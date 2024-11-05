import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // 导入 ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // 导入样式
import { QuizList } from './pages/QuizList';
import { IdiomPage } from './pages/IdiomPage'; // 成语解释页面
import { HomePage } from './pages/HomePage'; // 新增主页组件
import { DevModePage } from './pages/DevModePage'; // 新增开发者模式页面
import { UploadConfigPage } from './pages/UploadConfig';
import { CategoryEditorPage } from './pages/CategoryEditorPage';
import { IdiomInfo } from './components/IdiomInfo';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/study.svg" alt="学习图标" className="mr-2" style={{ width: '30px', height: '30px' }} /> {/* 使用学习图标 */}
            </Link>
            <nav className="ml-4"> {/* 使用 ml-auto 将导航菜单推到右边 */}
              <ul className="flex space-x-4">
                <li>
                  <Link to="/quiz" className="text-blue-500 hover:underline">
                    开始测验
                  </Link>
                </li>
                <li>
                  <Link to="/idiom" className="text-blue-500 hover:underline">
                    成语解释
                  </Link>
                </li>
                <li>
                  <Link to="/devmode" className="text-blue-500 hover:underline">
                    开发者
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<HomePage />} /> {/* 新增主页路由 */}
            <Route path="/quiz" element={<QuizList />} /> {/* 原有的测验列表路由 */}
            <Route path="/idiom" element={<IdiomPage />} /> {/* 成语解释页面路由 */}
            <Route path="/devmode" element={<DevModePage />} /> {/* 开发者模式路由 */}
            <Route path="/devmode/uploadconfig" element={<UploadConfigPage />} />
            <Route path="/devmode/category" element={<CategoryEditorPage />} />
            <Route path="/idiom/:idiomId" element={<IdiomInfo />} /> {/* 动态路由 */}
          </Routes>
        </main>
        <ToastContainer /> {/* 添加 ToastContainer */}
      </div>
    </BrowserRouter>
  );
}

export default App;