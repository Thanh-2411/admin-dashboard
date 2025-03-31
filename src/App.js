import React, { useState } from 'react';
import { TrashIcon, CheckCircleIcon, XCircleIcon, PlusCircleIcon, UsersIcon, FolderIcon, Bars3Icon, PencilIcon, ClockIcon } from '@heroicons/react/24/outline';
import Notification from './components/Notification';

function App() {
  const [activeTab, setActiveTab] = useState('members');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State cho Member Manager
  const [testers, setTesters] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [testLeaders, setTestLeaders] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', role: 'tester' });

  // State cho Test Project Manager
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', customer: '' });
  const [selectedTesters, setSelectedTesters] = useState([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [bugFile, setBugFile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // Bộ lọc trạng thái
  const [editProject, setEditProject] = useState(null); // Dự án đang chỉnh sửa
  const [showHistory, setShowHistory] = useState(null); // Dự án đang xem lịch sử
  const [projectLogs, setProjectLogs] = useState({}); // Lịch sử hành động

  // Hàm xử lý Member Manager
  const addMember = () => {
    if (newMember.name.trim() === '') return;
    const name = newMember.name.trim();
    if (newMember.role === 'tester' && !testers.includes(name)) {
      setTesters([...testers, name]);
    } else if (newMember.role === 'customer' && !customers.includes(name)) {
      setCustomers([...customers, name]);
    } else if (newMember.role === 'testLeader' && !testLeaders.includes(name)) {
      setTestLeaders([...testLeaders, name]);
    }
    setNewMember({ name: '', role: 'tester' });
  };

  const removeMember = (role, name) => {
    if (role === 'tester') setTesters(testers.filter(t => t !== name));
    else if (role === 'customer') setCustomers(customers.filter(c => c !== name));
    else if (role === 'testLeader') setTestLeaders(testLeaders.filter(l => l !== name));
  };

  // Hàm xử lý Test Project Manager
  const addProject = () => {
    if (newProject.name.trim() === '' || newProject.customer.trim() === '') return;
    const projectId = Date.now();
    setProjects([...projects, { ...newProject, id: projectId, status: 'pending', createdAt: new Date().toISOString() }]);
    setProjectLogs(prev => ({
      ...prev,
      [projectId]: [`Tạo dự án bởi Admin vào ${new Date().toLocaleString()}`]
    }));
    setNewProject({ name: '', customer: '' });
  };

  // AI gợi ý tester
  const suggestTesters = () => {
    if (testers.length === 0) return [];
    const testerWorkload = testers.map(tester => ({
      name: tester,
      count: projects.filter(p => p.assignedTesters && p.assignedTesters.includes(tester)).length
    }));
    const sortedTesters = testerWorkload.sort((a, b) => a.count - b.count);
    return sortedTesters.slice(0, 2).map(t => t.name); // Gợi ý 2 tester ít việc nhất
  };

  const approveProject = (projectId) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, status: 'approved', assignedTesters: selectedTesters.length > 0 ? selectedTesters : suggestTesters() } : p
    ));
    const project = projects.find(p => p.id === projectId);
    setNotifications([...notifications, 
      `Thông báo: Dự án ${project.name} đã được duyệt. Tester: ${(selectedTesters.length > 0 ? selectedTesters : suggestTesters()).join(', ')}`
    ]);
    setProjectLogs(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), `Duyệt bởi Admin vào ${new Date().toLocaleString()}`]
    }));
    setSelectedTesters([]);
  };

  const rejectProject = (projectId) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, status: 'rejected', reason: rejectionReason } : p
    ));
    const project = projects.find(p => p.id === projectId);
    setNotifications([...notifications, 
      `Thông báo: Dự án ${project.name} đã bị từ chối. Lý do: ${rejectionReason}`
    ]);
    setProjectLogs(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), `Từ chối bởi Admin vào ${new Date().toLocaleString()}`]
    }));
    setRejectionReason('');
  };

  const handleFileUpload = (e) => setBugFile(e.target.files[0]);

  const sendBugFile = () => {
    if (bugFile) {
      setNotifications([...notifications, `File bug ${bugFile.name} đã được gửi về Customer.`]);
      setBugFile(null);
    }
  };

  const addRequest = (projectId, requestType) => {
    const project = projects.find(p => p.id === projectId);
    setRequests([...requests, { id: Date.now(), project: project.name, type: requestType }]);
    setNotifications([...notifications, 
      `Yêu cầu từ Customer: ${requestType} cho dự án ${project.name}`
    ]);
    setProjectLogs(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), `Yêu cầu ${requestType} bởi Admin vào ${new Date().toLocaleString()}`]
    }));
  };

  const updateProject = () => {
    if (!editProject) return;
    setProjects(projects.map(p => 
      p.id === editProject.id ? { ...p, name: editProject.name, customer: editProject.customer } : p
    ));
    setProjectLogs(prev => ({
      ...prev,
      [editProject.id]: [...(prev[editProject.id] || []), `Chỉnh sửa bởi Admin vào ${new Date().toLocaleString()}`]
    }));
    setEditProject(null);
  };

  // Lọc dự án theo trạng thái
  const filteredProjects = projects.filter(project => 
    filterStatus === 'all' || project.status === filterStatus
  );

  // Thống kê dự án
  const stats = {
    pending: projects.filter(p => p.status === 'pending').length,
    approved: projects.filter(p => p.status === 'approved').length,
    rejected: projects.filter(p => p.status === 'rejected').length
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h1>Nền tảng kiểm thử</h1>
        <nav>
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
        </nav>
      </aside>

      {/* Menu toggle for mobile */}
      <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* Main content */}
      <main className="main-content">
        {activeTab === 'members' && (
          <div className="card">
            <h2>
              Quản lý thành viên
              <span className="tooltip">
                <PlusCircleIcon />
                <span className="tooltip-text">Thêm thành viên mới</span>
              </span>
            </h2>
            <div className="form-group">
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Tên thành viên"
                style={{ flex: 1 }}
              />
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              >
                <option value="tester">Tester</option>
                <option value="customer">Customer</option>
                <option value="testLeader">Test Leader</option>
              </select>
              <button onClick={addMember} className="btn-primary">
                <PlusCircleIcon /> Thêm
              </button>
            </div>
            <div className="list-grid">
              <div>
                <h3>Danh sách Tester</h3>
                <ul className="space-y-2">
                  {testers.map((tester, index) => (
                    <li key={index} className="list-item">
                      {tester}
                      <span className="tooltip">
                        <button
                          onClick={() => removeMember('tester', tester)}
                          className="delete-btn"
                        >
                          <TrashIcon />
                        </button>
                        <span className="tooltip-text">Xóa tester</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Danh sách Customer</h3>
                <ul className="space-y-2">
                  {customers.map((customer, index) => (
                    <li key={index} className="list-item">
                      {customer}
                      <span className="tooltip">
                        <button
                          onClick={() => removeMember('customer', customer)}
                          className="delete-btn"
                        >
                          <TrashIcon />
                        </button>
                        <span className="tooltip-text">Xóa customer</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Danh sách Test Leader</h3>
                <ul className="space-y-2">
                  {testLeaders.map((leader, index) => (
                    <li key={index} className="list-item">
                      {leader}
                      <span className="tooltip">
                        <button
                          onClick={() => removeMember('testLeader', leader)}
                          className="delete-btn"
                        >
                          <TrashIcon />
                        </button>
                        <span className="tooltip-text">Xóa test leader</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="card">
            <h2>
              Quản lý dự án kiểm thử
              <span className="tooltip">
                <PlusCircleIcon />
                <span className="tooltip-text">Thêm dự án mới</span>
              </span>
            </h2>

            {/* Thống kê nhanh */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3>Đang chờ duyệt</h3>
                <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3>Đã duyệt</h3>
                <p className="text-2xl font-semibold text-green-600">{stats.approved}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3>Đã từ chối</h3>
                <p className="text-2xl font-semibold text-red-600">{stats.rejected}</p>
              </div>
            </div>

            {/* Form thêm dự án */}
            <div className="form-group">
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Tên dự án"
                style={{ flex: 1 }}
              />
              <input
                type="text"
                value={newProject.customer}
                onChange={(e) => setNewProject({ ...newProject, customer: e.target.value })}
                placeholder="Customer"
                style={{ flex: 1 }}
              />
              <button onClick={addProject} className="btn-primary">
                <PlusCircleIcon /> Nhận dự án
              </button>
            </div>

            {/* Bộ lọc trạng thái */}
            <div className="mb-4">
              <label className="mr-2">Lọc theo trạng thái:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border rounded-lg"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Đang chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Đã từ chối</option>
              </select>
            </div>

            {/* Bảng danh sách dự án */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left border-b">Tên dự án</th>
                    <th className="p-3 text-left border-b">Customer</th>
                    <th className="p-3 text-left border-b">Trạng thái</th>
                    <th className="p-3 text-left border-b">Tester</th>
                    <th className="p-3 text-left border-b">Hành động</th>
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
                            project.status === 'approved'
                              ? 'status-approved'
                              : project.status === 'rejected'
                              ? 'status-rejected'
                              : 'status-pending'
                          }
                        >
                          {project.status === 'approved' && <CheckCircleIcon />}
                          {project.status === 'rejected' && <XCircleIcon />}
                          {project.status}
                        </span>
                      </td>
                      <td className="p-3 border-b">
                        {project.assignedTesters ? project.assignedTesters.join(', ') : '-'}
                      </td>
                      <td className="p-3 border-b">
                        <div className="gap-2 flex flex-wrap">
                          {project.status === 'pending' && (
                            <>
                              <select
                                multiple
                                onChange={(e) => setSelectedTesters([...e.target.selectedOptions].map(o => o.value))}
                                className="p-2 border rounded-lg"
                              >
                                {testers.map((tester, index) => (
                                  <option key={index} value={tester}>{tester}</option>
                                ))}
                              </select>
                              <span className="tooltip">
                                <button
                                  onClick={() => approveProject(project.id)}
                                  className="btn-success"
                                >
                                  <CheckCircleIcon /> Duyệt
                                </button>
                                <span className="tooltip-text">Duyệt dự án (AI gợi ý nếu không chọn)</span>
                              </span>
                              <input
                                type="text"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Lý do từ chối"
                                className="p-2 border rounded-lg"
                              />
                              <span className="tooltip">
                                <button
                                  onClick={() => rejectProject(project.id)}
                                  className="btn-danger"
                                >
                                  <XCircleIcon /> Từ chối
                                </button>
                                <span className="tooltip-text">Từ chối dự án</span>
                              </span>
                            </>
                          )}
                          {(project.status === 'approved' || project.status === 'rejected') && (
                            <>
                              <span className="tooltip">
                                <button
                                  onClick={() => addRequest(project.id, 'Hỗ trợ')}
                                  className="btn-info"
                                >
                                  Yêu cầu hỗ trợ
                                </button>
                                <span className="tooltip-text">Gửi yêu cầu hỗ trợ</span>
                              </span>
                              <span className="tooltip">
                                <button
                                  onClick={() => addRequest(project.id, 'Mở lại dự án')}
                                  className="btn-info"
                                >
                                  Mở lại dự án
                                </button>
                                <span className="tooltip-text">Yêu cầu mở lại</span>
                              </span>
                            </>
                          )}
                          <span className="tooltip">
                            <button
                              onClick={() => setEditProject(project)}
                              className="btn-primary"
                            >
                              <PencilIcon />
                            </button>
                            <span className="tooltip-text">Chỉnh sửa dự án</span>
                          </span>
                          <span className="tooltip">
                            <button
                              onClick={() => setShowHistory(project.id)}
                              className="btn-primary"
                            >
                              <ClockIcon />
                            </button>
                            <span className="tooltip-text">Xem lịch sử</span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal chỉnh sửa dự án */}
            {editProject && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                  <h3 className="mb-4">Chỉnh sửa dự án</h3>
                  <div className="form-group">
                    <input
                      type="text"
                      value={editProject.name}
                      onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                      placeholder="Tên dự án"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      value={editProject.customer}
                      onChange={(e) => setEditProject({ ...editProject, customer: e.target.value })}
                      placeholder="Customer"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <div className="gap-2">
                    <button onClick={updateProject} className="btn-primary">
                      Lưu
                    </button>
                    <button onClick={() => setEditProject(null)} className="btn-danger">
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal lịch sử hành động */}
            {showHistory && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                  <h3 className="mb-4">Lịch sử hành động</h3>
                  <ul className="space-y-2">
                    {(projectLogs[showHistory] || []).map((log, index) => (
                      <li key={index} className="p-2 bg-gray-50 rounded-lg">
                        {log}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setShowHistory(null)} className="btn-primary mt-4">
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {/* Gửi file bug */}
            <div className="mt-6">
              <h3>Gửi file bug</h3>
              <div className="form-group">
                <input type="file" onChange={handleFileUpload} style={{ flex: 1 }} />
                <button onClick={sendBugFile} className="btn-primary">
                  Gửi
                </button>
              </div>
            </div>

            <Notification messages={notifications} />

            {/* Yêu cầu từ Customer */}
            <div className="mt-6">
              <h3>Yêu cầu từ Customer</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left border-b">Loại yêu cầu</th>
                      <th className="p-3 text-left border-b">Dự án</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(request => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="p-3 border-b">{request.type}</td>
                        <td className="p-3 border-b">{request.project}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;