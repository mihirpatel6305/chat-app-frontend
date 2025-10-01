export default function LogoutModal({ setIsOpenLogout, handleLogout }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100/60 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Confirm Logout
        </h2>
        <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsOpenLogout(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-sm transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
