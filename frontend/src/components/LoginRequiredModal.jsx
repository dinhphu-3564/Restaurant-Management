function LoginRequiredModal({ onClose, onLogin }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl px-6 py-8 text-center relative">
        <div className="w-28 h-28 rounded-full bg-[#fbf3df] mx-auto flex items-center justify-center relative">
          <div className="w-16 h-16 rounded-2xl border-4 border-green-800 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-4 border-green-800"></div>
          </div>

          <div className="absolute right-4 bottom-5 w-12 h-12 rounded-xl bg-[#d6a84f] flex items-center justify-center text-white text-xl">
            🔒
          </div>
        </div>

        <h2 className="mt-6 text-2xl font-black text-green-950 leading-tight">
          Vui lòng đăng nhập
          <br />
          để đặt món và đặt bàn
        </h2>

        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-20 h-px bg-[#d6a84f]"></div>
          <span className="text-[#b88935]">🐐</span>
          <div className="w-20 h-px bg-[#d6a84f]"></div>
        </div>

        <p className="text-sm text-gray-500 mt-5 leading-relaxed">
          Đăng nhập để lưu thông tin, theo dõi đơn hàng
          <br />
          và nhận nhiều ưu đãi hấp dẫn từ Dê Hương Sơn.
        </p>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <button
            onClick={onClose}
            className="h-14 rounded-2xl border-2 border-[#e7d8bb] text-gray-700 font-bold hover:bg-[#faf7ef] transition"
          >
            Bỏ qua
          </button>

          <button
            onClick={onLogin}
            className="h-14 rounded-2xl bg-green-900 text-white font-bold hover:bg-green-950 transition shadow-lg"
          >
            Đăng nhập / Đăng ký
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2 text-xs text-gray-500">
          <p>Không đặt món, đặt bàn</p>
          <p>Tiếp tục đặt món, đặt bàn</p>
        </div>
      </div>
    </div>
  );
}

export default LoginRequiredModal;
