import { useState, useEffect } from "react";
import { getAuthToken } from "../../utils/auth";
import { showAdminToast } from "../../components/admin/AdminToast";

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/activity-logs", {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      } else {
        showAdminToast({ title: "Lỗi", description: data.message, type: "error" });
      }
    } catch (error) {
      showAdminToast({ title: "Lỗi", description: "Không thể kết nối đến server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nhật ký hoạt động (Audit Logs)</h1>
        <button
          onClick={fetchLogs}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
        >
          Làm mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Đang tải...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người thao tác
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chi tiết
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.created_at).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {log.actor_user_name || "Hệ thống"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.message}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    Không có nhật ký nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
