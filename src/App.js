import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { TrashIcon, CheckCircleIcon, XCircleIcon, PlusCircleIcon, UsersIcon, FolderIcon, Bars3Icon, EyeIcon, BellIcon, PaperAirplaneIcon, ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState(JSON.parse(localStorage.getItem('projects')) || []);
  const [testers] = useState(['Tester 1', 'Tester 2', 'Tester 3']);
  const [selectedTesters, setSelectedTesters] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [notifications, setNotifications] = useState(JSON.parse(localStorage.getItem('notifications')) || []);
  const [bugFile, setBugFile] = useState(null);

  const project = projects.find(p => p.id === parseInt(projectId));

  if (!project) {
    return <div className="text-center text-gray-500">Dự án không tồn tại!</div>;
  }

  // API giả lập gán tester
  const assignTestersToProject = async (projectId, testers) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: `Tester ${testers.join(', ')} đã được gán vào dự án.` });
      }, 1000);
    });
  };

  // Duyệt dự án
  const approveProject = async () => {
    if (selectedTesters.length === 0) {
      alert('Vui lòng chọn ít nhất một tester!');
      return;
    }

    const response = await assignTestersToProject(project.id, selectedTesters);
    if (response.success) {
      const updatedProjects = projects.map(p => 
        p.id === project.id ? { ...p, status: 'accepted', subStatus: 'ongoing', assignedTesters: selectedTesters } : p
      );
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      const updatedNotifications = [...notifications, `Dự án ${project.name} đã được duyệt. Tester: ${selectedTesters.join(', ')}`];
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      navigate('/projects');
    }
  };

  // Từ chối dự án
  const rejectProject = () => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }
    const updatedProjects = projects.map(p => 
      p.id === project.id ? { ...p, status: 'reject', reason: rejectionReason } : p
    );
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    const updatedNotifications = [...notifications, `Dự án ${project.name} đã bị từ chối. Lý do: ${rejectionReason}`];
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    setRejectionReason('');
    setShowRejectPopup(false);
    navigate('/projects');
  };

  // Đánh dấu dự án hoàn thành
  const markProjectAsCompleted = () => {
    // Chỉ cho phép chuyển từ "ongoing" sang "completed"
    if (project.subStatus !== 'ongoing') {
      alert('Dự án không ở trạng thái "Đang thực hiện" để hoàn thành!');
      return;
    }

    const updatedProjects = projects.map(p => 
      p.id === project.id ? { ...p, subStatus: 'completed' } : p
    );
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    const updatedNotifications = [...notifications, `Dự án ${project.name} đã hoàn thành.`];
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Gửi file bug
  const handleFileUpload = (e) => setBugFile(e.target.files[0]);

  const sendBugFile = () => {
    if (bugFile) {
      const updatedNotifications = [...notifications, `File bug ${bugFile.name} đã được gửi về Customer cho dự án ${project.name}.`];
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      setBugFile(null);
    }
  };

  // Yêu cầu mở lại dự án
  const requestReopenProject = () => {
    const updatedNotifications = [...notifications, `Yêu cầu mở lại dự án ${project.name} đã được gửi.`];
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Yêu cầu hỗ trợ
  const requestSupport = () => {
    const updatedNotifications = [...notifications, `Yêu cầu hỗ trợ cho dự án ${project.name} đã được gửi.`];
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  // Hàm hiển thị trạng thái với văn bản rõ ràng hơn
  const displayStatus = () => {
    if (project.status === 'accepted') {
      if (project.subStatus === 'ongoing') {
        return 'Accepted (Đang thực hiện)';
      } else if (project.subStatus === 'completed') {
        return 'Accepted (Đã thực hiện xong)';
      }
    }
    return project.status; // Các trạng thái khác (open, reject) giữ nguyên
  };

  return (
    <div className="main-content">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/projects')} className="btn-back">
            <ArrowLeftIcon className="w-5 h-5 mr-2" /> Quay lại
          </button>
          <h2 className="text-center flex-1">Chi tiết dự án</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Tên dự án:</strong> {project.name}</p>
            <p><strong>Customer:</strong> {project.customer}</p>
            <p><strong>Mô tả:</strong> {project.description || 'Không có mô tả'}</p>
            <p><strong>Trạng thái:</strong> {displayStatus()}</p>
            <p><strong>Tester:</strong> {project.assignedTesters ? project.assignedTesters.join(', ') : '-'}</p>
            <p><strong>Ngày tạo:</strong> {new Date(project.createdAt).toLocaleString()}</p>
            {project.status === 'reject' && (
              <p><strong>Lý do từ chối:</strong> {project.reason}</p>
            )}
          </div>

          {project.status === 'open' && (
            <>
              <div className="mt-4">
                <h3>Lựa chọn Tester</h3>
                <div className="tester-selection">
                  {testers.map((tester, index) => (
                    <label key={index} className="tester-option">
                      <input
                        type="checkbox"
                        value={tester}
                        checked={selectedTesters.includes(tester)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTesters([...selectedTesters, tester]);
                          } else {
                            setSelectedTesters(selectedTesters.filter(t => t !== tester));
                          }
                        }}
                      />
                      <span>{tester}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <button onClick={approveProject} className="btn-success">
                  <CheckCircleIcon /> Accept
                </button>
                <button onClick={() => setShowRejectPopup(true)} className="btn-danger">
                  <XCircleIcon /> Reject
                </button>
              </div>
            </>
          )}

          {project.status === 'accepted' && project.subStatus === 'ongoing' && (
            <div className="mt-4 flex gap-2 justify-center">
              <button onClick={markProjectAsCompleted} className="btn-success">
                <CheckCircleIcon /> Hoàn thành
              </button>
              <button onClick={requestSupport} className="btn-info">
                <PaperAirplaneIcon /> Yêu cầu hỗ trợ
              </button>
            </div>
          )}

          {project.status === 'accepted' && project.subStatus === 'completed' && (
            <>
              <div className="mt-4">
                <h3>Gửi file bug cho Customer</h3>
                <div className="form-group">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="p-2 border rounded-lg w-full shadow-sm"
                  />
                  <button onClick={sendBugFile} className="btn-primary">
                    <PaperAirplaneIcon /> Gửi file
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <h3>Mở lại dự án</h3>
                <button onClick={requestReopenProject} className="btn-info w-full">
                  <ArrowPathIcon /> Yêu cầu mở lại
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Popup từ chối dự án */}
      {showRejectPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h3 className="mb-4 text-center">Lý do từ chối</h3>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Nhập lý do từ chối"
              className="p-2 border rounded-lg w-full mb-4 shadow-sm focus:ring-2 focus:ring-red-500"
            />
            <div className="gap-2 flex justify-center">
              <button onClick={rejectProject} className="btn-danger">
                Xác nhận
              </button>
              <button onClick={() => setShowRejectPopup(false)} className="btn-primary">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('members');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [memberTab, setMemberTab] = useState('testers');
  const [projectTab, setProjectTab] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(JSON.parse(localStorage.getItem('notifications')) || []);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // State cho Member Manager
  const [testers, setTesters] = useState(['Tester 1', 'Tester 2', 'Tester 3']);
  const [customers, setCustomers] = useState(['Customer 1', 'Customer 2']);
  const [testLeaders, setTestLeaders] = useState(['Test Leader 1']);

  // State cho Test Project Manager
  const [projects, setProjects] = useState(JSON.parse(localStorage.getItem('projects')) || []);
  const [newProject, setNewProject] = useState({ name: '', customer: '', description: '' });

  // Hiển thị popup thông báo khi có thông báo mới
  useEffect(() => {
    if (notifications.length > 0) {
      setShowNotificationPopup(true);
      const timer = setTimeout(() => {
        setShowNotificationPopup(false);
      }, 3000); // Popup tự động đóng sau 3 giây
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Lọc danh sách thành viên
  const filteredTesters = testers.filter(tester =>
    tester.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCustomers = customers.filter(customer =>
    customer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTestLeaders = testLeaders.filter(leader =>
    leader.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Xóa thành viên
  const removeMember = (role, name) => {
    if (role === 'tester') setTesters(testers.filter(t => t !== name));
    else if (role === 'customer') setCustomers(customers.filter(c => c !== name));
    else if (role === 'testLeader') setTestLeaders(testLeaders.filter(l => l !== name));
  };

  // Thêm dự án mới
  const addProject = () => {
    if (newProject.name.trim() === '' || newProject.customer.trim() === '') return;
    const projectId = Date.now();
    const updatedProjects = [...projects, { ...newProject, id: projectId, status: 'open', createdAt: new Date().toISOString(), subStatus: null }];
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    const updatedNotifications = [...notifications, `Dự án ${newProject.name} đã được nhận từ Customer.`];
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    setNewProject({ name: '', customer: '', description: '' });
  };

  // Lọc dự án theo trạng thái
  const filteredProjects = projects.filter(project => 
    projectTab === 'all' || project.status === projectTab
  );

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <img src="/logo.svg" alt="Arena Logo" className="logo" />
          <nav>
            <Link to="/members">
              <div
                className={`nav-item ${activeTab === 'members' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('members');
                  setSidebarOpen(false);
                }}
              >
                <UsersIcon />
                Quản lý thành viên
              </div>
            </Link>
            <Link to="/projects">
              <div
                className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('projects');
                  setSidebarOpen(false);
                }}
              >
                <FolderIcon />
                Quản lý dự án
              </div>
            </Link>
          </nav>
          <div className="notification-section">
            <div className="nav-item">
              <BellIcon />
              Thông báo
            </div>
            <div className="notification-list">
              {notifications.map((notification, index) => (
                <div key={index} className="notification-item">
                  {notification}
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-center text-gray-300">Không có thông báo</p>
              )}
            </div>
          </div>
        </aside>

        {/* Menu toggle for mobile */}
        <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Popup thông báo */}
        {showNotificationPopup && notifications.length > 0 && (
          <div className="notification-popup">
            <BellIcon className="w-5 h-5 mr-2" />
            <span>{notifications[notifications.length - 1]}</span>
          </div>
        )}

        {/* Main content */}
        <Routes>
          <Route path="/members" element={
            <main className="main-content">
              <div className="card">
                <h2 className="text-center">Quản lý thành viên</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm thành viên..."
                    className="p-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-4 flex gap-2 justify-center">
                  <button
                    className={`px-4 py-2 rounded-lg ${memberTab === 'testers' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setMemberTab('testers')}
                  >
                    Danh sách Tester
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${memberTab === 'customers' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setMemberTab('customers')}
                  >
                    Danh sách Customer
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${memberTab === 'testLeaders' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setMemberTab('testLeaders')}
                  >
                    Danh sách Test Leader
                  </button>
                </div>
                <div className="overflow-x-auto">
                  {memberTab === 'testers' && (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left border-b">Tên Tester</th>
                          <th className="p-3 text-left border-b">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTesters.map((tester, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3 border-b">{tester}</td>
                            <td className="p-3 border-b">
                              <span className="tooltip">
                                <button
                                  onClick={() => removeMember('tester', tester)}
                                  className="delete-btn"
                                >
                                  <TrashIcon />
                                </button>
                                <span className="tooltip-text">Xóa tester</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredTesters.length === 0 && (
                          <tr>
                            <td colSpan="2" className="p-3 text-center text-gray-500">
                              Không tìm thấy Tester
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                  {memberTab === 'customers' && (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left border-b">Tên Customer</th>
                          <th className="p-3 text-left border-b">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map((customer, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3 border-b">{customer}</td>
                            <td className="p-3 border-b">
                              <span className="tooltip">
                                <button
                                  onClick={() => removeMember('customer', customer)}
                                  className="delete-btn"
                                >
                                  <TrashIcon />
                                </button>
                                <span className="tooltip-text">Xóa customer</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredCustomers.length === 0 && (
                          <tr>
                            <td colSpan="2" className="p-3 text-center text-gray-500">
                              Không tìm thấy Customer
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                  {memberTab === 'testLeaders' && (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left border-b">Tên Test Leader</th>
                          <th className="p-3 text-left border-b">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTestLeaders.map((leader, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3 border-b">{leader}</td>
                            <td className="p-3 border-b">
                              <span className="tooltip">
                                <button
                                  onClick={() => removeMember('testLeader', leader)}
                                  className="delete-btn"
                                >
                                  <TrashIcon />
                                </button>
                                <span className="tooltip-text">Xóa test leader</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredTestLeaders.length === 0 && (
                          <tr>
                            <td colSpan="2" className="p-3 text-center text-gray-500">
                              Không tìm thấy Test Leader
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </main>
          } />
          <Route path="/projects" element={
            <main className="main-content">
              <div className="card">
                <h2 className="text-center">Quản lý dự án</h2>

                {/* Form nhận dự án từ Customer */}
                <div className="form-group justify-center">
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Tên dự án"
                    className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                    style={{ flex: 1, maxWidth: '300px' }}
                  />
                  <input
                    type="text"
                    value={newProject.customer}
                    onChange={(e) => setNewProject({ ...newProject, customer: e.target.value })}
                    placeholder="Customer"
                    className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                    style={{ flex: 1, maxWidth: '300px' }}
                  />
                  <input
                    type="text"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Mô tả dự án"
                    className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                    style={{ flex: 1, maxWidth: '300px' }}
                  />
                  <button onClick={addProject} className="btn-primary">
                    <PlusCircleIcon /> Nhận dự án
                  </button>
                </div>

                {/* Tabs cho Test Project Manager */}
                <div className="mb-4 flex gap-2 justify-center">
                  <button
                    className={`px-4 py-2 rounded-lg ${projectTab === 'open' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setProjectTab('open')}
                  >
                    Open
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${projectTab === 'accepted' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setProjectTab('accepted')}
                  >
                    Accepted
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${projectTab === 'reject' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setProjectTab('reject')}
                  >
                    Reject
                  </button>
                </div>

                {/* Bảng danh sách dự án */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left border-b">Tên dự án</th>
                        <th className="p-3 text-left border-b">Customer</th>
                        <th className="p-3 text-left border-b">Trạng thái</th>
                        <th className="p-3 text-left border-b">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map(project => (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td className="p-3 border-b">{project.name}</td>
                          <td className="p-3 border-b">{project.customer}</td>
                          <td className="p-3 border-b">
                            <span
                              className={
                                project.status === 'accepted'
                                  ? 'status-approved'
                                  : project.status === 'reject'
                                  ? 'status-rejected'
                                  : 'status-pending'
                              }
                            >
                              {project.status === 'accepted' && <CheckCircleIcon />}
                              {project.status === 'reject' && <XCircleIcon />}
                              {project.status === 'accepted'
                                ? project.subStatus === 'ongoing'
                                  ? 'Accepted (Đang thực hiện)'
                                  : 'Accepted (Đã thực hiện xong)'
                                : project.status}
                            </span>
                          </td>
                          <td className="p-3 border-b">
                            <span className="tooltip">
                              <Link to={`/project/${project.id}`}>
                                <button className="btn-info">
                                  <EyeIcon />
                                </button>
                              </Link>
                              <span className="tooltip-text">Xem chi tiết</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
          } />
          <Route path="/project/:projectId" element={<ProjectDetail />} />
          <Route path="/" element={<Link to="/members" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;