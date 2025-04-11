import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { TrashIcon, CheckCircleIcon, XCircleIcon, PlusCircleIcon, UsersIcon, FolderIcon, Bars3Icon, EyeIcon, BellIcon, PaperAirplaneIcon, ArrowPathIcon, ArrowLeftIcon, CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

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

  const assignTestersToProject = async (projectId, testers) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: `Tester ${testers.join(', ')} đã được gán vào dự án.` });
      }, 1000);
    });
  };

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

  const markProjectAsCompleted = () => {
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

  const handleFileUpload = (e) => setBugFile(e.target.files[0]);

  const sendBugFile = () => {
    if (bugFile) {
      const updatedNotifications = [...notifications, `File bug ${bugFile.name} đã được gửi về Customer cho dự án ${project.name}.`];
      setNotifications(updatedNotifications);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      setBugFile(null);
    }
  };

  const requestReopenProject = () => {
    const updatedNotifications = [...notifications, `Yêu cầu mở lại dự án ${project.name} đã được gửi.`];
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const requestSupport = () => {
    const updatedNotifications = [...notifications, `Yêu cầu hỗ trợ cho dự án ${project.name} đã được gửi.`];
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const displayStatus = () => {
    if (project.status === 'accepted') {
      if (project.subStatus === 'ongoing') {
        return 'Accepted (Đang thực hiện)';
      } else if (project.subStatus === 'completed') {
        return 'Accepted (Đã thực hiện xong)';
      }
    }
    return project.status;
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

function PayoutManager() {
  const [payoutTab, setPayoutTab] = useState('receive');
  const [transactions, setTransactions] = useState(JSON.parse(localStorage.getItem('transactions')) || []);
  const [newTransaction, setNewTransaction] = useState({
    project: '',
    customer: '',
    amount: '',
    recipient: '',
    role: '',
  });
  const [notifications, setNotifications] = useState(JSON.parse(localStorage.getItem('notifications')) || []);

  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  const customers = JSON.parse(localStorage.getItem('customers')) || [];
  const testers = JSON.parse(localStorage.getItem('testers')) || [];
  const testLeaders = JSON.parse(localStorage.getItem('testLeaders')) || [];

  const handleReceivePayment = () => {
    if (!newTransaction.project || !newTransaction.customer || !newTransaction.amount) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const transaction = {
      id: Date.now(),
      type: 'receive',
      project: newTransaction.project,
      customer: newTransaction.customer,
      amount: parseFloat(newTransaction.amount),
      status: 'completed',
      date: new Date().toISOString(),
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

    const updatedNotifications = [...notifications, `Đã nhận thanh toán ${newTransaction.amount} từ ${newTransaction.customer} cho dự án ${newTransaction.project}.`];
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

    setNewTransaction({ project: '', customer: '', amount: '', recipient: '', role: '' });
  };

  const handlePayout = () => {
    if (!newTransaction.recipient || !newTransaction.role || !newTransaction.amount) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const transaction = {
      id: Date.now(),
      type: 'payout',
      recipient: newTransaction.recipient,
      role: newTransaction.role,
      amount: parseFloat(newTransaction.amount),
      status: 'completed',
      date: new Date().toISOString(),
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

    const updatedNotifications = [...notifications, `Đã thanh toán ${newTransaction.amount} cho ${newTransaction.recipient} (${newTransaction.role}).`];
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

    setNewTransaction({ project: '', customer: '', amount: '', recipient: '', role: '' });
  };

  return (
    <main className="main-content">
      <div className="card">
        <h2 className="text-center">Payout Manager</h2>

        <div className="mb-4 flex gap-2 justify-center">
          <button
            className={`px-4 py-2 rounded-lg ${payoutTab === 'receive' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setPayoutTab('receive')}
          >
            Nhận thanh toán từ Customer
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${payoutTab === 'payout' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setPayoutTab('payout')}
          >
            Thanh toán cho Tester/Test Leader
          </button>
        </div>

        {payoutTab === 'receive' && (
          <div className="form-group justify-center">
            <select
              value={newTransaction.project}
              onChange={(e) => setNewTransaction({ ...newTransaction, project: e.target.value })}
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              style={{ flex: 1, maxWidth: '300px' }}
            >
              <option value="">Chọn dự án</option>
              {projects.map(project => (
                <option key={project.id} value={project.name}>{project.name}</option>
              ))}
            </select>
            <select
              value={newTransaction.customer}
              onChange={(e) => setNewTransaction({ ...newTransaction, customer: e.target.value })}
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              style={{ flex: 1, maxWidth: '300px' }}
            >
              <option value="">Chọn Customer</option>
              {customers.map((customer, index) => (
                <option key={index} value={customer}>{customer}</option>
              ))}
            </select>
            <input
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              placeholder="Số tiền"
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              style={{ flex: 1, maxWidth: '300px' }}
            />
            <button onClick={handleReceivePayment} className="btn-primary">
              <CurrencyDollarIcon /> Nhận thanh toán
            </button>
          </div>
        )}

        {payoutTab === 'payout' && (
          <div className="form-group justify-center">
            <select
              value={newTransaction.recipient}
              onChange={(e) => setNewTransaction({ ...newTransaction, recipient: e.target.value })}
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              style={{ flex: 1, maxWidth: '300px' }}
            >
              <option value="">Chọn người nhận</option>
              {testers.map((tester, index) => (
                <option key={`tester-${index}`} value={tester}>{tester}</option>
              ))}
              {testLeaders.map((leader, index) => (
                <option key={`leader-${index}`} value={leader}>{leader}</option>
              ))}
            </select>
            <select
              value={newTransaction.role}
              onChange={(e) => setNewTransaction({ ...newTransaction, role: e.target.value })}
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              style={{ flex: 1, maxWidth: '300px' }}
            >
              <option value="">Chọn vai trò</option>
              <option value="Tester">Tester</option>
              <option value="Test Leader">Test Leader</option>
            </select>
            <input
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              placeholder="Số tiền"
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              style={{ flex: 1, maxWidth: '300px' }}
            />
            <button onClick={handlePayout} className="btn-success">
              <CurrencyDollarIcon /> Thanh toán
            </button>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-center">Lịch sử giao dịch</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left border-b">Loại giao dịch</th>
                  <th className="p-3 text-left border-b">Dự án/Người nhận</th>
                  <th className="p-3 text-left border-b">Số tiền</th>
                  <th className="p-3 text-left border-b">Trạng thái</th>
                  <th className="p-3 text-left border-b">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{transaction.type === 'receive' ? 'Nhận thanh toán' : 'Thanh toán'}</td>
                    <td className="p-3 border-b">
                      {transaction.type === 'receive' ? `${transaction.customer} (${transaction.project})` : `${transaction.recipient} (${transaction.role})`}
                    </td>
                    <td className="p-3 border-b">{transaction.amount.toLocaleString()} VNĐ</td>
                    <td className="p-3 border-b">
                      <span
                        className={
                          transaction.status === 'completed'
                            ? 'status-approved'
                            : transaction.status === 'pending'
                            ? 'status-pending'
                            : 'status-rejected'
                        }
                      >
                        {transaction.status === 'completed' && <CheckCircleIcon />}
                        {transaction.status === 'pending' && <XCircleIcon />}
                        {transaction.status}
                      </span>
                    </td>
                    <td className="p-3 border-b">{new Date(transaction.date).toLocaleString()}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-gray-500">
                      Không có giao dịch nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

function Statistics() {
  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

  // Dữ liệu cho biểu đồ trạng thái dự án (Bar Chart)
  const projectStatusData = {
    labels: ['Open', 'Accepted', 'Reject'],
    datasets: [
      {
        label: 'Số lượng dự án',
        data: [
          projects.filter(p => p.status === 'open').length,
          projects.filter(p => p.status === 'accepted').length,
          projects.filter(p => p.status === 'reject').length,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)', // Màu cho Open
          'rgba(54, 162, 235, 0.6)', // Màu cho Accepted
          'rgba(255, 206, 86, 0.6)', // Màu cho Reject
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Dữ liệu cho biểu đồ giao dịch theo thời gian (Line Chart)
  const transactionDataByDate = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { receive: 0, payout: 0 };
    }
    if (transaction.type === 'receive') {
      acc[date].receive += transaction.amount;
    } else if (transaction.type === 'payout') {
      acc[date].payout += transaction.amount;
    }
    return acc;
  }, {});

  const dates = Object.keys(transactionDataByDate).sort((a, b) => new Date(a) - new Date(b));
  const receiveData = dates.map(date => transactionDataByDate[date].receive);
  const payoutData = dates.map(date => transactionDataByDate[date].payout);

  const transactionData = {
    labels: dates,
    datasets: [
      {
        label: 'Số tiền nhận (VNĐ)',
        data: receiveData,
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
      {
        label: 'Số tiền thanh toán (VNĐ)',
        data: payoutData,
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Thống kê',
      },
    },
  };

  return (
    <main className="main-content">
      <div className="card">
        <h2 className="text-center">Thống kê báo cáo</h2>

        {/* Biểu đồ trạng thái dự án */}
        <div className="mt-6">
          <h3 className="text-center">Thống kê trạng thái dự án</h3>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Bar data={projectStatusData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Số lượng dự án theo trạng thái' } } }} />
          </div>
        </div>

        {/* Biểu đồ giao dịch theo thời gian */}
        <div className="mt-6">
          <h3 className="text-center">Thống kê giao dịch theo thời gian</h3>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Line data={transactionData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Số tiền nhận/thanh toán theo thời gian' } } }} />
          </div>
        </div>
      </div>
    </main>
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

  const [testers, setTesters] = useState(JSON.parse(localStorage.getItem('testers')) || ['Tester 1', 'Tester 2', 'Tester 3']);
  const [customers, setCustomers] = useState(JSON.parse(localStorage.getItem('customers')) || ['Customer 1', 'Customer 2']);
  const [testLeaders, setTestLeaders] = useState(JSON.parse(localStorage.getItem('testLeaders')) || ['Test Leader 1']);

  const [projects, setProjects] = useState(JSON.parse(localStorage.getItem('projects')) || []);
  const [newProject, setNewProject] = useState({ name: '', customer: '', description: '' });

  useEffect(() => {
    if (notifications.length > 0) {
      setShowNotificationPopup(true);
      const timer = setTimeout(() => {
        setShowNotificationPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const filteredTesters = testers.filter(tester =>
    tester.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCustomers = customers.filter(customer =>
    customer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTestLeaders = testLeaders.filter(leader =>
    leader.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removeMember = (role, name) => {
    if (role === 'tester') {
      const updatedTesters = testers.filter(t => t !== name);
      setTesters(updatedTesters);
      localStorage.setItem('testers', JSON.stringify(updatedTesters));
    } else if (role === 'customer') {
      const updatedCustomers = customers.filter(c => c !== name);
      setCustomers(updatedCustomers);
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    } else if (role === 'testLeader') {
      const updatedTestLeaders = testLeaders.filter(l => l !== name);
      setTestLeaders(updatedTestLeaders);
      localStorage.setItem('testLeaders', JSON.stringify(updatedTestLeaders));
    }
  };

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
            <Link to="/payout">
              <div
                className={`nav-item ${activeTab === 'payout' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('payout');
                  setSidebarOpen(false);
                }}
              >
                <CurrencyDollarIcon />
                Payout Manager
              </div>
            </Link>
            <Link to="/statistics">
              <div
                className={`nav-item ${activeTab === 'statistics' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('statistics');
                  setSidebarOpen(false);
                }}
              >
                <ChartBarIcon />
                Thống kê báo cáo
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
          <Route path="/payout" element={<PayoutManager />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/" element={<Link to="/members" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;