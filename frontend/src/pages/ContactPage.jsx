import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  Menu,
  X,
  User,
  UserRound,
  ClipboardList,
  CalendarCheck,
  LogOut,
  ShoppingCart,
  Phone,
  MapPin,
  Clock,
  Mail,
  Send,
  ChefHat,
  ShieldCheck,
  Heart,
  Navigation,
  MessageCircle,
  Star,
  CalendarDays,
} from "lucide-react";

import hero3 from "../assets/images/Home/hero-3.png";
import deNuongTang from "../assets/images/menu/de-nuong-tang.jpg";
import lauDe from "../assets/images/menu/lau-de.jpg";
import goatIcon from "../assets/images/Icon_De.png";
import gtMonAn from "../assets/images/Contact/gt-mon-an.png";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100088682802201";
const ZALO_URL = "https://zalo.me/0387136878";

function ContactPage() {
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(false);
  const [errors, setErrors] = useState({});

  const totalCartQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");

    const updateCartQty = () => {
      const savedCart = localStorage.getItem("cartItems");
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    };

    updateCartQty();
    window.addEventListener("cartUpdated", updateCartQty);
    window.addEventListener("storage", updateCartQty);

    return () => {
      window.removeEventListener("cartUpdated", updateCartQty);
      window.removeEventListener("storage", updateCartQty);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToContact = () => {
    document.getElementById("contact-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToMap = () => {
    document.getElementById("contact-map")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // hàm yêu cầu nhập đúng sđt
  // hàm yêu cầu nhập đúng sđt
  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.target;
    const phone = form.phone.value.trim();

    // SĐT Việt Nam: bắt đầu 03, 05, 07, 08, 09 và đủ 10 số
    const phoneRegex = /^(0[35789])[0-9]{8}$/;

    if (!phoneRegex.test(phone)) {
      setErrors({
        phone: "Số điện thoại không hợp lệ.",
      });
      return;
    }

    setErrors({});
    setToast(true);

    setTimeout(() => {
      setToast(false);
    }, 3000);

    form.reset();
  };

  return (
    <div className="min-h-screen bg-[#fbf7ec] text-green-900">
      {toast && (
        <div className="fixed top-20 right-5 z-[9999] bg-white border border-[#eadfcd] shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 w-[330px] max-w-[calc(100vw-32px)]">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <Send className="w-5 h-5 text-green-700" />
          </div>

          <div>
            <p className="font-black text-green-900">Gửi liên hệ thành công</p>
            <p className="text-sm text-gray-600">
              Nhà hàng sẽ phản hồi bạn sớm nhất.
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto h-16 px-5 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-2">
            <img
              src={goatIcon}
              alt="Dê Hương Sơn"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="font-bold text-green-800 leading-4">
                Dê Hương Sơn
              </h1>
              <p className="text-xs text-green-700 font-medium">HÀ TĨNH</p>
            </div>
          </Link>

          <nav className="hidden lg:flex gap-8 text-sm font-semibold">
            <Link to="/home">Trang chủ</Link>
            <Link to="/menu">Thực đơn</Link>
            <Link to="/reservation">Đặt bàn</Link>
            <Link to="/deals">Khuyến mãi</Link>
            <Link to="/about">Giới thiệu</Link>
            <Link
              to="/contact"
              className="text-green-800 border-b-2 border-green-800 pb-2"
            >
              Liên hệ
            </Link>
          </nav>

          <div className="hidden md:flex gap-3">
            {isLoggedIn ? (
              <div
                ref={profileMenuRef}
                className="relative flex items-center gap-3"
              >
                <Link to="/cart" className="relative text-green-900">
                  <ShoppingCart className="w-5 h-5" />

                  {totalCartQty > 0 && (
                    <span className="absolute -top-5 -right-4 min-w-[22px] h-[22px] px-1.5 bg-red-600 rounded-full text-[11px] font-bold text-white flex items-center justify-center border-2 border-white shadow">
                      {totalCartQty}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-11 h-11 rounded-full bg-green-50 text-green-800 flex items-center justify-center border border-green-700 hover:bg-green-100 transition"
                >
                  <User className="w-6 h-6" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[999]">
                    <Link
                      to="/profile"
                      className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium hover:bg-green-50 hover:text-green-800 transition border-t"
                    >
                      <UserRound className="w-5 h-5" />
                      Thông tin tài khoản
                    </Link>

                    <Link
                      to="/order-history"
                      className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium hover:bg-green-50 hover:text-green-800 transition border-t"
                    >
                      <ClipboardList className="w-5 h-5" />
                      Lịch sử đơn hàng
                    </Link>

                    <Link
                      to="/my-booking"
                      className="flex items-center gap-4 px-4 py-3 text-gray-800 font-medium hover:bg-green-50 hover:text-green-800 transition border-t"
                    >
                      <CalendarCheck className="w-5 h-5" />
                      Đặt bàn của tôi
                    </Link>

                    <button
                      onClick={() => {
                        localStorage.removeItem("isLoggedIn");
                        setIsLoggedIn(false);
                        setIsProfileOpen(false);
                        navigate("/home");
                      }}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 text-red-600 font-medium border-t"
                    >
                      <LogOut className="w-5 h-5" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="border border-green-800 text-green-800 px-5 py-2 rounded-lg font-semibold hover:bg-green-50"
                >
                  Đăng nhập
                </Link>

                <Link
                  to="/register"
                  className="bg-green-800 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-green-900"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-lg border border-green-800 text-green-800 flex items-center justify-center"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-md">
            <nav className="px-5 py-4 flex flex-col gap-4 text-sm font-semibold text-green-900">
              <Link to="/home">Trang chủ</Link>
              <Link to="/menu">Thực đơn</Link>
              <Link to="/reservation">Đặt bàn</Link>
              <Link to="/deals">Khuyến mãi</Link>
              <Link to="/about">Giới thiệu</Link>
              <Link to="/contact" className="text-green-800 font-black">
                Liên hệ
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section
        className="relative min-h-[430px] md:min-h-[520px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,35,18,.96), rgba(0,35,18,.72), rgba(0,0,0,.25)),
            url(${hero3})
          `,
        }}
      >
        <div className="max-w-7xl mx-auto px-5 w-full">
          <div className="max-w-xl text-white">
            <p
              className="text-5xl md:text-7xl text-[#d6a84f] leading-none mb-1"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              Liên hệ
            </p>

            <h1 className="text-4xl md:text-6xl font-black uppercase leading-tight">
              Dê Hương Sơn
            </h1>

            <div className="flex items-center gap-4 my-5">
              <div className="w-24 h-px bg-[#d6a84f]"></div>
              <img
                src={goatIcon}
                alt="Dê Hương Sơn"
                className="w-10 h-10 object-contain brightness-0 invert"
              />
              <div className="w-24 h-px bg-[#d6a84f]"></div>
            </div>

            <p className="text-white/85 leading-relaxed max-w-md">
              Chúng tôi luôn sẵn sàng phục vụ, lắng nghe và hỗ trợ bạn đặt bàn,
              đặt món hoặc tư vấn không gian phù hợp.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <a
                href="tel:0387136878"
                className="h-12 px-7 rounded-xl bg-[#d6a84f] hover:bg-[#c99a45] text-green-900 font-black flex items-center justify-center gap-2 shadow-lg"
              >
                <Phone className="w-5 h-5" />
                Gọi ngay
              </a>

              <button
                onClick={scrollToMap}
                className="h-12 px-7 rounded-xl border border-[#d6a84f] text-[#d6a84f] font-black flex items-center justify-center gap-2 hover:bg-[#d6a84f] hover:text-green-900 transition"
              >
                <MapPin className="w-5 h-5" />
                Chỉ đường
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INFO BAR */}
      <section className="max-w-7xl mx-auto px-5 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-[#eadfcd] grid sm:grid-cols-2 lg:grid-cols-4 overflow-hidden">
          <ContactInfo
            icon={<Phone />}
            title="Hotline"
            main="038 713 6878"
            sub="Call / Zalo"
          />
          <ContactInfo
            icon={<MapPin />}
            title="Địa chỉ"
            main="Đ. Vũ Lăng "
            sub="Thanh Trì, Hà Nội"
          />
          <ContactInfo
            icon={<Clock />}
            title="Giờ mở cửa"
            main="08:00 - 22:00"
            sub="Tất cả các ngày trong tuần"
          />
          <ContactInfo
            icon={<Mail />}
            title="Email"
            main="dehuongson.ht@gmail.com"
            sub="Phản hồi trong ngày"
          />
        </div>
      </section>

      {/* MAP + FORM */}
      <section className="max-w-7xl mx-auto px-5 py-12 grid lg:grid-cols-2 gap-7">
        <div
          id="contact-map"
          className="bg-white rounded-3xl border border-[#eadfcd] shadow-md overflow-hidden h-[500px]"
        >
          <div className="relative h-full">
            <iframe
              title="Bản đồ Dê Hương Sơn"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3939.8604880385988!2d105.84806467548728!3d20.937626480689012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad9f6221f4b3%3A0x23e41af49c85fe1a!2zTmjDoCBow6BuZyBC4bqjbyBMb25nIC0gRMOqIE7DumkgSMawxqFuZyBTxqFu!5e1!3m2!1svi!2s!4v1781164163918!5m2!1svi!2s"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="absolute left-4 bottom-16 z-20 flex flex-col gap-3">
              <a
                href="https://maps.app.goo.gl/wSkET5ThBjNm9f29A"
                target="_blank"
                rel="noreferrer"
                className=" bg-green-900 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl hover:bg-green-900 hover:scale-110 transition"
              >
                <Navigation className="w-6 h-6" />
              </a>

              <a
                href="tel:0387136878"
                className="w-12 h-12 rounded-full bg-[#d6a84f] text-white shadow-2xl flex items-center justify-center hover:scale-110 transition"
              >
                <Phone className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div
          id="contact-form"
          className="bg-white rounded-3xl border border-[#eadfcd] shadow-md p-5 md:p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-2.5xl font-black text-green-900 uppercase">
              Gửi liên hệ cho chúng tôi
            </h2>

            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="w-16 h-px bg-[#d6a84f]"></div>
              <img
                src={goatIcon}
                alt="Dê Hương Sơn"
                className="w-7 h-7 object-contain"
              />
              <div className="w-16 h-px bg-[#d6a84f]"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <input
                  required
                  name="fullName"
                  placeholder="Họ và tên *"
                  className="h-12 w-full rounded-xl border border-[#eadfcd] px-4 outline-none focus:border-green-800 bg-[#fffaf0]"
                />
              </div>

              <div>
                <input
                  required
                  type="tel"
                  maxLength={10}
                  name="phone"
                  placeholder="Số điện thoại *"
                  className={`h-12 w-full rounded-xl border px-4 outline-none bg-[#fffaf0] ${
                    errors.phone
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#eadfcd] focus:border-green-800"
                  }`}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");

                    if (errors.phone) {
                      setErrors({});
                    }
                  }}
                />

                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1 leading-snug">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <input
              type="email"
              placeholder="Email"
              className="w-full h-12 rounded-xl border border-[#eadfcd] px-4 outline-none focus:border-green-800 bg-[#fffaf0]"
            />

            <textarea
              required
              rows="4"
              placeholder="Nội dung liên hệ *"
              className="w-full rounded-xl border border-[#eadfcd] px-4 py-3 outline-none focus:border-green-800 bg-[#fffaf0] resize-none"
            ></textarea>

            <button className="w-full h-13 rounded-xl bg-[#d6a84f] hover:bg-[#c99a45] text-green-900 font-black flex items-center justify-center gap-2 transition">
              <Send className="w-5 h-5" />
              Gửi liên hệ
            </button>
          </form>
        </div>
      </section>

      {/* WHY */}
      <section className="max-w-7xl mx-auto px-5 pb-12">
        <div className="bg-green-900 rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-black uppercase text-[#d6a84f]">
              Vì sao chọn Dê Hương Sơn?
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="w-16 h-px bg-[#d6a84f]"></div>
              <img
                src={goatIcon}
                alt="Dê Hương Sơn"
                className="w-10 h-10 object-contain brightness-0 invert"
              />
              <div className="w-16 h-px bg-[#d6a84f]"></div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <WhyItem
              icon={<ShieldCheck />}
              title="Nguyên liệu tươi ngon"
              text="Dê núi tuyển chọn kỹ, chế biến trong ngày."
            />
            <WhyItem
              icon={<ChefHat />}
              title="Đầu bếp kinh nghiệm"
              text="Chuẩn vị đặc sản Hương Sơn, đậm đà khó quên."
            />
            <WhyItem
              icon={<MapPin />}
              title="Không gian sang trọng"
              text="Phù hợp gia đình, sinh nhật, liên hoan."
            />
            <WhyItem
              icon={<Heart />}
              title="Khách hàng là trung tâm"
              text="Tận tâm, nhanh chóng, chu đáo trong từng bữa ăn."
            />
          </div>
        </div>
      </section>

      {/* SOCIAL */}
      <section className="max-w-7xl mx-auto px-5 pb-10 text-center">
        <h2 className="text-xl md:text-2xl font-black uppercase text-green-900">
          Kết nối với chúng tôi
        </h2>

        <div className="flex items-center justify-center gap-3 mt-3 mb-7">
          <div className="w-16 h-px bg-[#d6a84f]"></div>
          <img
            src={goatIcon}
            alt="Dê Hương Sơn"
            className="w-7 h-7 object-contain"
          />
          <div className="w-16 h-px bg-[#d6a84f]"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noreferrer"
            className="w-12 h-12 rounded-full bg-green-900 flex items-center justify-center hover:bg-[#d6a84f] transition"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
              alt="Facebook"
              className="w-5 h-5"
            />
          </a>

          <a
            href="tel:0387136878"
            className="w-12 h-12 rounded-full bg-green-900 text-white flex items-center justify-center hover:bg-[#d6a84f] hover:text-green-900 transition"
          >
            <Phone className="w-5 h-5" />
          </a>

          <button
            onClick={scrollToMap}
            className="w-12 h-12 rounded-full bg-green-900 text-white flex items-center justify-center hover:bg-[#d6a84f] hover:text-green-900 transition"
          >
            <MapPin className="w-5 h-5" />
          </button>

          <a
            href={ZALO_URL}
            target="_blank"
            rel="noreferrer"
            className="w-12 h-12 rounded-full bg-green-900 flex items-center justify-center hover:bg-[#d6a84f] transition"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
              alt="Zalo"
              className="w-6 h-6"
            />
          </a>
        </div>
      </section>

      {/* CTA */}

      <section className="max-w-7xl mx-auto px-5 pb-12">
        <div
          className="relative overflow-hidden rounded-[36px] shadow-xl bg-cover bg-center"
          style={{
            backgroundImage: `
        linear-gradient(
          90deg,
          rgba(0,45,24,.92) 0%,
          rgba(0,45,24,.82) 42%,
          rgba(0,45,24,.55) 70%,
          rgba(0,45,24,.35) 100%
        ),
        url(${gtMonAn})
      `,
          }}
        >
          <div className="px-6 md:px-12 py-12 md:py-16 grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-16 h-px bg-[#d6a84f]" />
                <img
                  src={goatIcon}
                  alt=""
                  className="w-8 h-8 object-contain brightness-0 invert"
                />
                <div className="w-16 h-px bg-[#d6a84f]" />
              </div>

              <p className="text-[#d6a84f] font-black uppercase tracking-wide">
                Sẵn sàng thưởng thức
              </p>

              <h2 className="text-3xl md:text-5xl font-black text-white uppercase leading-tight mt-3">
                Đặc sản dê núi
                <br />
                <span className="text-[#d6a84f]">Hương Sơn ?</span>
              </h2>

              <p className="text-white/85 mt-5 max-w-2xl leading-7">
                Đặt bàn ngay hôm nay để thưởng thức những món ăn đặc sản được
                chế biến từ dê núi tuyển chọn trong không gian ấm cúng và sang
                trọng.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
              <button
                onClick={() => navigate("/reservation")}
                className="h-14 px-8 rounded-2xl bg-[#d6a84f] text-green-950 font-black flex items-center justify-center gap-3 hover:bg-[#c99a45] transition shadow-lg"
              >
                <CalendarDays className="w-5 h-5" />
                Đặt bàn ngay
              </button>

              <a
                href="tel:0387136878"
                className="h-14 px-8 rounded-2xl border border-[#d6a84f] text-[#d6a84f] font-black flex items-center justify-center gap-3 hover:bg-[#d6a84f] hover:text-green-950 transition"
              >
                <Phone className="w-5 h-5" />
                Gọi cho chúng tôi
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-5 py-7 md:py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          <div>
            <Link to="/home" className="flex items-center gap-2 mb-3">
              <img
                src={goatIcon}
                alt="Dê Hương Sơn"
                className="w-10 h-10 object-contain brightness-0 invert"
              />
              <div>
                <h3 className="text-xl font-bold leading-5">Dê Hương Sơn</h3>
                <p className="text-sm text-white/70">Hà Tĩnh</p>
              </div>
            </Link>

            <p className="text-white/75 text-sm leading-relaxed mb-2 md:mb-5 max-w-xs">
              Dê núi Hương Sơn – đậm đà bản sắc, tươi ngon, bổ dưỡng.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-5">Thông tin liên hệ</h3>

            <div className="space-y-4 text-sm text-white/80">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#d6a84f] shrink-0 mt-0.5" />

                <a
                  href="https://maps.app.goo.gl/wSkET5ThBjNm9f29A"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  Đ. Vũ Lăng
                  <br />
                  Thanh Trì, Hà Nội
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#d6a84f]" />
                <a href="tel:0387136878" className="hover:text-white">
                  038 713 6878
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#d6a84f]" />
                <a
                  href="mailto:dehuongson.ht@gmail.com"
                  className="hover:text-white break-all"
                >
                  dehuongson.ht@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-5">Giờ mở cửa</h3>

            <div className="space-y-4 text-sm text-white/80">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#d6a84f]" />
                <span>08:00 - 22:00</span>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-[#d6a84f]" />
                <span>Tất cả các ngày trong tuần</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-bold text-lg mb-5">Kết nối với chúng tôi</h3>

            <div className="flex gap-4 items-center justify-center">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
                  alt="Facebook"
                  className="w-5 h-5"
                />
              </a>

              <a
                href="tel:0387136878"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          <a
            href="https://maps.app.goo.gl/wSkET5ThBjNm9f29A"
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-2xl border border-white/10 h-40 group"
          >
            <iframe
              title="Bản đồ Dê Hương Sơn"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3939.8604880385988!2d105.84806467548728!3d20.937626480689012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad9f6221f4b3%3A0x23e41af49c85fe1a!2zTmjDoCBow6BuZyBC4bqjbyBMb25nIC0gRMOqIE7DumkgSMawxqFuZyBTxqFu!5e1!3m2!1svi!2s!4v1781164163918!5m2!1svi!2s"
              className="w-full h-full border-0 pointer-events-none"
              loading="lazy"
            />
          </a>
        </div>

        <div className="border-t border-white/15 text-center py-3 text-xs md:text-sm text-white/60">
          © 2026 Dê Hương Sơn Hà Tĩnh. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function ContactInfo({ icon, title, main, sub }) {
  return (
    <div className="p-5 md:p-6 flex items-center gap-4 border-b sm:border-r border-[#eadfcd] last:border-r-0">
      <div className="w-14 h-14 rounded-full bg-green-900 text-[#d6a84f] flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div>
        <p className="text-xs uppercase font-black text-gray-500">{title}</p>
        <h3 className="font-black text-green-900 mt-1">{main}</h3>
        <p className="text-xs text-gray-500 mt-1">{sub}</p>
      </div>
    </div>
  );
}

function WhyItem({ icon, title, text }) {
  return (
    <div className="px-4 lg:border-r border-white/15 last:border-r-0">
      <div className="w-14 h-14 rounded-full border border-[#d6a84f] text-[#d6a84f] flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>

      <h3 className="font-black text-white uppercase text-sm">{title}</h3>
      <p className="text-white/70 text-sm mt-2 leading-relaxed">{text}</p>
    </div>
  );
}

function FooterItem({ title, text }) {
  return (
    <div>
      <h3 className="font-bold text-lg mb-3 md:mb-5">{title}</h3>
      <p className="text-white/75 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export default ContactPage;
