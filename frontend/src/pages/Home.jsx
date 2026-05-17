import { useEffect, useState } from "react";
import hero1 from "../assets/images/hero-1.jpg";
import hero2 from "../assets/images/hero-2.jpg";
import hero3 from "../assets/images/hero-3.jpg";
import {
  Leaf,
  ShoppingCart,
  ShieldCheck,
  CalendarDays,
  ChefHat,
  Heart,
  Star,
  MapPin,
  Phone,
  Clock,
  Mountain,
  CookingPot,
  Users,
  Award,
  Truck,
  PlayCircle,
} from "lucide-react";

function Home() {
  const heroImages = [hero1, hero2, hero3];

  const [currentHero, setCurrentHero] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const dishes = [
    { name: "Dê hấp tía tô", price: "250.000đ", tag: "Bán chạy" },
    { name: "Dê nướng mọi", price: "250.000đ", tag: "Bán chạy" },
    { name: "Lẩu dê thuốc bắc", price: "300.000đ" },
    { name: "Dê xào sả ớt", price: "250.000đ" },
  ];

  const reasons = [
    {
      icon: <Leaf />,
      title: "Thịt dê tươi mỗi ngày",
      text: "Đảm bảo độ tươi ngon, không đông lạnh",
    },
    {
      icon: <ChefHat />,
      title: "Đầu bếp giàu kinh nghiệm",
      text: "Nhiều năm kinh nghiệm chế biến chuẩn vị",
    },
    {
      icon: <Clock />,
      title: "Phục vụ nhanh chóng",
      text: "Quy trình chuyên nghiệp, tiết kiệm thời gian",
    },
    {
      icon: <Award />,
      title: "Giá cả hợp lý",
      text: "Chất lượng xứng đáng với giá tiền",
    },
    {
      icon: <Users />,
      title: "Khách hàng là ưu tiên",
      text: "Tận tâm phục vụ, trải nghiệm hài lòng",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbf7ec] text-green-950">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto h-16 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-green-800" />
            <div>
              <h1 className="font-bold text-green-800 leading-4">
                Dê Hương Sơn
              </h1>
              <p className="text-xs text-green-700 font-medium">HÀ TĨNH</p>
            </div>
          </div>

          <nav className="hidden lg:flex gap-8 text-sm font-semibold">
            <a
              className="text-green-800 border-b-2 border-green-800 pb-2"
              href="#"
            >
              Trang chủ
            </a>
            <a href="#">Thực đơn</a>
            <a href="#">Đặt bàn</a>
            <a href="#">Khuyến mãi</a>
            <a href="#">Giới thiệu</a>
            <a href="#">Liên hệ</a>
          </nav>

          <div className="hidden md:flex gap-3">
            <button className="border border-green-800 text-green-800 px-5 py-2 rounded-lg font-semibold hover:bg-green-50">
              Đăng nhập
            </button>
            <button className="bg-green-800 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-green-900">
              Đăng ký
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[720px] overflow-hidden">
        {/* BACKGROUND SLIDER */}
        {heroImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt="Dê Hương Sơn"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[2500ms] ease-in-out ${
              index === currentHero
                ? "opacity-100 scale-105"
                : "opacity-0 scale-100"
            }`}
          />
        ))}

        {/* OVERLAY CINEMATIC */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#fbf7ec]/45"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf7ec]/35 via-transparent to-transparent"></div>

        {/* LỚP PHỦ ĐỂ CHỮ DỄ ĐỌC */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/55 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-[#fbf7ec]/40"></div>

        <div className="relative max-w-7xl mx-auto px-5 pt-28 pb-36">
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="text-center max-w-2xl">
              <p
                className="text-7xl md:text-8xl text-green-800 mb-0 leading-none drop-shadow-sm"
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                Đặc sản
              </p>

              <h2 className="text-5xl md:text-7xl font-black text-green-900 uppercase leading-tight">
                Dê Hương Sơn
              </h2>

              <h3 className="text-3xl md:text-4xl font-bold text-green-800 tracking-[0.25em] mt-2">
                Hà Tĩnh
              </h3>

              <div className="flex items-center justify-center gap-4 my-5">
                <div className="w-28 h-px bg-green-700"></div>
                <Leaf className="w-6 h-6 text-green-800" />
                <div className="w-28 h-px bg-green-700"></div>
              </div>

              <p className="text-gray-700 max-w-md mx-auto mb-7 leading-relaxed">
                Thưởng thức hương vị dê núi Hương Sơn
                <br /> đậm đà bản sắc – tươi ngon, bổ dưỡng.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <button className="bg-green-800 hover:bg-green-900 text-white px-7 py-3 rounded-full font-semibold shadow-lg transition">
                  <Leaf className="w-4 h-4 inline mr-2" />
                  Khám phá ngay
                </button>

                <button className="bg-[#c99a45] hover:bg-[#b88935] text-white px-7 py-3 rounded-full font-semibold shadow-lg border-2 border-white transition">
                  <CalendarDays className="w-4 h-4 inline mr-2" />
                  Đặt bàn ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-5 -mt-23 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden">
          <Feature
            icon={<Mountain />}
            title="Nguồn gốc rõ ràng"
            text="Dê núi Hương Sơn thả tự nhiên"
          />
          <Feature
            icon={<Leaf />}
            title="Nguyên liệu tươi"
            text="Tuyển chọn mỗi ngày, đảm bảo chất lượng"
          />
          <Feature
            icon={<CookingPot />}
            title="Chế biến truyền thống"
            text="Công thức gia truyền, chuẩn vị đặc trưng"
          />
          <Feature
            icon={<Heart />}
            title="An toàn vệ sinh"
            text="Đảm bảo vệ sinh, an tâm thưởng thức"
          />
        </div>
      </section>

      {/* DISHES */}
      <section className="max-w-7xl mx-auto px-5 py-16">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase">
              Món ngon nổi bật
            </h2>
            <p className="text-gray-600 mt-1">
              Những món ăn được yêu thích nhất tại Dê Hương Sơn
            </p>
          </div>

          <a
            className="hidden md:block text-green-800 text-sm font-bold"
            href="#"
          >
            Xem tất cả thực đơn →
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dishes.map((dish) => (
            <div
              key={dish.name}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:-translate-y-1 transition"
            >
              <div className="relative h-44 bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                {dish.tag && (
                  <span className="absolute top-3 left-3 bg-green-800 text-white text-xs px-3 py-1 rounded-full uppercase">
                    {dish.tag}
                  </span>
                )}
                Ảnh món ăn
              </div>

              <div className="p-4">
                <h3 className="font-bold mb-1">{dish.name}</h3>
                <p className="text-green-800 font-bold mb-4">{dish.price}</p>

                <button className="w-full border border-green-800 text-green-800 rounded-lg py-2 font-semibold hover:bg-green-800 hover:text-white transition">
                  <ShoppingCart className="w-4 h-4 inline mr-2" />
                  Đặt món
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          <span className="w-2 h-2 rounded-full bg-green-800"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
        </div>
      </section>

      {/* ABOUT */}
      <section className="max-w-7xl mx-auto px-5 pb-12">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="min-h-[420px] bg-amber-100 rounded-3xl flex items-center justify-center text-green-800 font-bold shadow-md">
            Khu vực ảnh nhà hàng / đầu bếp
          </div>

          <div className="bg-[#fffaf0] rounded-3xl p-8 md:p-10 shadow-md">
            <p className="text-3xl italic text-green-700 font-serif text-center">
              Về chúng tôi
            </p>

            <h2 className="text-4xl font-black text-green-900 text-center mt-2 mb-5 uppercase">
              Dê Hương Sơn Hà Tĩnh
            </h2>

            <p className="text-gray-700 leading-relaxed mb-8 text-center">
              Chúng tôi tự hào mang đến đặc sản dê núi Hương Sơn với hương vị
              đậm đà, thơm ngon và bổ dưỡng. Từ khâu chọn nguyên liệu đến chế
              biến, mỗi món ăn đều được chăm chút bằng cả tâm huyết.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 text-center">
              <Info icon={<Mountain />} title="Đặc sản dê núi" />
              <Info icon={<Leaf />} title="Nguyên liệu tươi" />
              <Info icon={<CookingPot />} title="Chế biến truyền thống" />
              <Info icon={<Heart />} title="Không gian ấm cúng" />
            </div>

            <div className="text-center mt-8">
              <button className="bg-green-800 text-white px-7 py-3 rounded-full font-semibold hover:bg-green-900">
                Tìm hiểu thêm về chúng tôi →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="max-w-7xl mx-auto px-5 pb-12">
        <div className="bg-white rounded-3xl shadow-md p-8">
          <h2 className="text-2xl font-black text-center uppercase mb-8">
            Vì sao chọn chúng tôi?
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
            {reasons.map((item) => (
              <Why
                key={item.title}
                icon={item.icon}
                title={item.title}
                text={item.text}
              />
            ))}
          </div>
        </div>
      </section>

      {/* PROMO + SPACE + REVIEWS */}
      <section className="max-w-7xl mx-auto px-5 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-green-900 text-white rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black uppercase">
                Khuyến mãi hấp dẫn
              </h2>
              <PlayCircle className="w-6 h-6" />
            </div>

            <Promo title="Combo gia đình" discount="-20%" price="1.199.000đ" />
            <Promo
              title="Giảm giá đặt online"
              discount="-15%"
              price="Đặt ngay"
            />
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black uppercase">
                Không gian nhà hàng
              </h2>
              <div className="flex gap-2">
                <button className="w-7 h-7 rounded-full border">‹</button>
                <button className="w-7 h-7 rounded-full border">›</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="h-40 bg-amber-100 rounded-2xl flex items-center justify-center text-green-800 font-semibold col-span-2">
                Ảnh không gian lớn
              </div>
              <div className="h-28 bg-amber-100 rounded-2xl flex items-center justify-center text-sm">
                Ảnh 1
              </div>
              <div className="h-28 bg-amber-100 rounded-2xl flex items-center justify-center text-sm">
                Ảnh 2
              </div>
            </div>

            <button className="mt-5 w-full border border-green-800 text-green-800 py-2 rounded-lg font-semibold">
              Xem thêm hình ảnh
            </button>
          </div>

          <div className="bg-[#fffaf0] rounded-3xl p-6 shadow-md">
            <h2 className="text-xl font-black uppercase mb-5">
              Khách hàng nói về chúng tôi
            </h2>

            <Review
              name="Anh Minh"
              text="Món dê ở đây rất ngon, thịt mềm ngọt, không bị hôi."
            />
            <Review
              name="Chị Trang"
              text="Không gian ấm cúng, nhân viên nhiệt tình."
            />
            <Review
              name="Anh Quốc"
              text="Đặt bàn online tiện lợi, lên món nhanh."
            />
          </div>
        </div>
      </section>

      {/* SERVICE BAR */}
      <section className="max-w-7xl mx-auto px-5 pb-10">
        <div className="bg-white rounded-3xl shadow-md grid sm:grid-cols-2 lg:grid-cols-4 overflow-hidden">
          <Service
            icon={<ChefHat />}
            title="100% dê núi Hương Sơn"
            text="Nguồn gốc rõ ràng"
          />
          <Service
            icon={<Award />}
            title="Cam kết chất lượng"
            text="Tươi ngon mỗi ngày"
          />
          <Service
            icon={<Truck />}
            title="Giao hàng nhanh"
            text="Trong nội thành"
          />
          <Service
            icon={<Phone />}
            title="Hotline đặt bàn"
            text="076 877 4619"
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-950 text-white">
        <div className="max-w-7xl mx-auto px-5 py-10 grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold leading-5">Dê Hương Sơn</h3>
                <p className="text-sm text-white/70">Hà Tĩnh</p>
              </div>
            </div>

            <p className="text-white/75 text-sm mb-5">
              Dê núi Hương Sơn – đậm đà bản sắc, tươi ngon, bổ dưỡng.
            </p>
          </div>

          {/* Thông tin liên hệ */}
          <div className="pl-2">
            <h3 className="font-bold mb-5">Thông tin liên hệ</h3>

            <div className="space-y-3 text-white/75 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1 text-white" />
                <p>
                  Thị trấn Phố Châu, <br />
                  Hương Sơn, Hà Tĩnh
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-white" />
                <p>
                  038 713 6878
                  <br />
                  076 877 4619
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-5 h-5 flex items-center justify-center text-white">
                  ✉
                </span>
                <p>dehuongson.ht@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Giờ mở cửa */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </span>

              <h3 className="font-bold">Giờ mở cửa</h3>
            </div>

            <div className="text-white/75 text-sm leading-8">
              <p>08:00 - 22:00</p>
              <p>Tất cả các ngày trong tuần</p>
            </div>
          </div>

          {/* Kết nối với chúng tôi */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </span>

              <h3 className="font-bold">Kết nối với chúng tôi</h3>
            </div>

            <div className="flex gap-3 mt-4 items-center">
              {/* Facebook */}
              <a
                href="#"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                  alt="facebook"
                  className="w-5 h-5"
                />
              </a>

              {/* Zalo */}
              <a
                href="#"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg"
                  alt="zalo"
                  className="w-6 h-6"
                />
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-3">Bản đồ</h3>
            <div className="h-32 bg-white/15 rounded-2xl flex items-center justify-center text-white/80 text-sm">
              Khu vực bản đồ
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 text-center py-4 text-sm text-white/60">
          © 2026 Dê Hương Sơn Hà Tĩnh. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="p-6 border-b sm:border-r border-gray-100 last:border-r-0 text-center">
      <div className="w-13 h-13 rounded-full border border-green-800 flex items-center justify-center text-green-800 mb-3 mx-auto">
        {icon}
      </div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}

function Info({ icon, title }) {
  return (
    <div>
      <div className="w-14 h-14 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-3 text-green-800">
        {icon}
      </div>
      <h3 className="font-bold text-green-900 text-sm">{title}</h3>
      <p className="text-xs text-gray-600 mt-1">Chuẩn vị đặc trưng</p>
    </div>
  );
}

function Why({ icon, title, text }) {
  return (
    <div className="px-3">
      <div className="w-12 h-12 rounded-full border border-green-800 flex items-center justify-center mx-auto mb-3 text-green-800">
        {icon}
      </div>
      <h3 className="font-bold mb-2 text-sm">{title}</h3>
      <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}

function Promo({ title, discount, price }) {
  return (
    <div className="bg-white text-green-950 rounded-2xl p-4 mb-4 flex items-center gap-4">
      <div className="w-24 h-24 bg-amber-100 rounded-2xl flex items-center justify-center text-xs text-green-800">
        Ảnh món
      </div>

      <div className="flex-1">
        <span className="bg-green-800 text-white px-3 py-1 rounded-full text-xs font-bold">
          {discount}
        </span>
        <h3 className="font-bold mt-2">{title}</h3>
        <p className="text-xs text-gray-600 mt-1">
          Ưu đãi đặc biệt dành cho khách hàng.
        </p>
        <p className="font-black text-green-800 mt-2">{price}</p>
      </div>
    </div>
  );
}

function Review({ name, text }) {
  return (
    <div className="bg-white rounded-2xl p-4 mb-4">
      <p className="text-sm text-gray-700 mb-2">{text}</p>
      <div className="text-yellow-500 text-sm mb-2">★★★★★</div>
      <p className="font-bold text-sm">{name}</p>
    </div>
  );
}

function Service({ icon, title, text }) {
  return (
    <div className="p-5 flex items-center gap-4 border-b lg:border-r border-gray-100 last:border-r-0">
      <div className="w-11 h-11 rounded-full bg-green-50 text-green-800 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-sm">{title}</h3>
        <p className="text-xs text-gray-600">{text}</p>
      </div>
    </div>
  );
}

function FooterItem({ icon, title, text }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          {icon}
        </span>
        <h3 className="font-bold">{title}</h3>
      </div>
      <p className="text-white/75 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export default Home;
