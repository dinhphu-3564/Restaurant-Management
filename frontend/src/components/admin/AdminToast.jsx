import { useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

// eslint-disable-next-line react-refresh/only-export-components
export const showAdminToast = ({
  title = "Thành công",
  message = "",
  type = "success",
} = {}) => {
  window.dispatchEvent(
    new CustomEvent("adminToast", {
      detail: {
        title,
        message,
        type,
      },
    }),
  );
};

function AdminToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleToast = (event) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast({
        title: event.detail?.title || "Thành công",
        message: event.detail?.message || "",
        type: event.detail?.type || "success",
      });

      timerRef.current = setTimeout(() => {
        setToast(null);
      }, 3000);
    };

    window.addEventListener("adminToast", handleToast);

    return () => {
      window.removeEventListener("adminToast", handleToast);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!toast) return null;

  const toastStyle = {
    success: {
      wrapper: "border-primary/20 bg-white",
      iconBox: "bg-primary/10 text-primary",
      title: "text-primary",
      bar: "bg-primary",
      icon: <CheckCircle size={22} />,
    },
    error: {
      wrapper: "border-red-100 bg-white",
      iconBox: "bg-red-50 text-red-600",
      title: "text-red-700",
      bar: "bg-red-600",
      icon: <XCircle size={22} />,
    },
    warning: {
      wrapper: "border-orange-100 bg-white",
      iconBox: "bg-orange-50 text-orange-600",
      title: "text-orange-700",
      bar: "bg-orange-500",
      icon: <AlertTriangle size={22} />,
    },
    info: {
      wrapper: "border-blue-100 bg-white",
      iconBox: "bg-blue-50 text-blue-600",
      title: "text-blue-700",
      bar: "bg-blue-600",
      icon: <Info size={22} />,
    },
  };

  const style = toastStyle[toast.type] || toastStyle.success;

  return (
    <div className="fixed top-[100px] right-5 z-[99999] w-[360px] max-w-[calc(100vw-32px)]">
      <div
        className={`relative overflow-hidden rounded-2xl border shadow-2xl ${style.wrapper} animate-[slideIn_.2s_ease-out]`}
      >
        <div className="p-4 flex items-start gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${style.iconBox}`}
          >
            {style.icon}
          </div>

          <div className="min-w-0 flex-1">
            <p className={`font-black text-sm ${style.title}`}>{toast.title}</p>

            {toast.message && (
              <p className="text-sm text-gray-600 font-semibold mt-1 leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={() => setToast(null)}
            className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex items-center justify-center shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="h-1 bg-gray-100">
          <div className={`h-full ${style.bar} animate-[toastBar_3s_linear]`} />
        </div>
      </div>
    </div>
  );
}

export default AdminToast;
