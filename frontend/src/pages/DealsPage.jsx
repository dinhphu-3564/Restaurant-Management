import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  Gift,
  Cake,
  CalendarDays,
  Percent,
  Star,
  Users,
  PhoneCall,
  CheckCircle,
  Utensils,
  Flag,
  MoonStar,
  TreePine,
  PartyPopper,
} from "lucide-react";

import goatIcon from "../assets/images/Icon_De.png";
import familyComboImg from "../assets/images/Deals/family-combo.png";
import birthdayImg from "../assets/images/Deals/birthday.png";
import onlineOrderImg from "../assets/images/Deals/online-order.png";
import comboCardImg from "../assets/images/Deals/combo-card.png";
import birthdayCardImg from "../assets/images/Deals/birthday-card.png";
import onlineCardImg from "../assets/images/Deals/online-card.png";
import bookingCardImg from "../assets/images/Deals/booking-card.png";
import restaurantSpace from "../assets/images/Deals/restaurant-space.png";
import goatFood from "../assets/images/Deals/goat-food.png";

function DealsPage() {
  const navigate = useNavigate();

  const [activeDealType, setActiveDealType] = useState("all");
  const [currentBanner, setCurrentBanner] = useState(0);

  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false);

      setTimeout(() => {
        setCurrentBanner((prev) => (prev + 1) % bannerDeals.length);

        setTimeout(() => {
          setIsAnimating(true);
        }, 50);
      }, 350);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const deals = [
    {
      id: "family-combo",
      type: "combo",
      label: "Ưu đãi đặc biệt",
      title: "Giảm ngay",
      percent: 20,
      name: "Combo gia đình",
      desc: "Ưu đãi đặc biệt dành cho khách đi theo nhóm gia đình.",
      condition: "Áp dụng cho hóa đơn từ 2.000.000đ",
      route: "/menu",
      button: "Đặt món ngay",
    },
    {
      id: "birthday",
      type: "birthday",
      label: "Ưu đãi sinh nhật",
      title: "Sinh nhật vui vẻ",
      percent: 15,
      name: "Ưu đãi hết ý",
      desc: "Giảm ngay 15% tổng hóa đơn cho bàn tiệc sinh nhật.",
      condition: "Áp dụng khi đặt bàn trước",
      route: "/booking",
      button: "Đặt bàn sinh nhật",
    },
    {
      id: "online-order",
      type: "food",
      label: "Ưu đãi đặt online",
      title: "Giảm ngay",
      percent: 10,
      name: "Khi đặt món online",
      desc: "Tiện lợi, nhanh chóng, ưu đãi hơn khi đặt qua website.",
      condition: "Áp dụng khi thanh toán online",
      route: "/menu",
      button: "Đặt online",
    },
  ];

  const smallDeals = [
    {
      icon: <Percent />,
      title: "Ưu đãi theo món",
      desc: "Nhiều món ngon giá ưu đãi đặc biệt",
      route: "/menu",
    },
    {
      icon: <CalendarDays />,
      title: "Ưu đãi đặt bàn",
      desc: "Đặt bàn trước nhận ưu đãi hấp dẫn",
      route: "/booking",
    },
    {
      icon: <Gift />,
      title: "Ưu đãi đặc biệt",
      desc: "Chương trình đặc biệt trong tháng",
      route: "/deals",
    },
  ];
  const dealTabs = [
    { key: "all", label: "Tất cả khuyến mãi" },
    { key: "combo", label: "Ưu đãi Combo" },
    { key: "food", label: "Ưu đãi theo món" },
    { key: "booking", label: "Ưu đãi đặt bàn" },
    { key: "birthday", label: "Ưu đãi sinh nhật" },
    { key: "special", label: "Ưu đãi đặc biệt" },
  ];

  const filteredDeals =
    activeDealType === "all"
      ? deals
      : deals.filter((deal) => deal.type === activeDealType);
  // Chi tiết từng deal
  const bannerDeals = [
    {
      id: "family-combo",
      image: familyComboImg,
      label: "Ưu đãi nổi bật",
      scriptTitle: "Combo gia đình",
      title: "Giảm",
      discount: "20%",
      desc: "Ưu đãi đặc biệt dành cho những bữa ăn sum vầy cùng gia đình và người thân.",
      conditions: ["Áp dụng hóa đơn từ 2.000.000đ", "Sử dụng tại nhà hàng"],
    },
    {
      id: "birthday",
      image: birthdayImg,
      label: "Ưu đãi sinh nhật",
      scriptTitle: "Sinh nhật vui vẻ",
      title: "Giảm",
      discount: "15%",
      desc: "Ưu đãi dành riêng cho bàn tiệc sinh nhật tại Dê Hương Sơn.",
      conditions: [
        "Áp dụng khi đặt bàn trước",
        "Xuất trình giấy tờ tùy thân",
        "Áp dụng quanh năm",
      ],
    },
    {
      id: "online-order",
      image: onlineOrderImg,
      label: "Ưu đãi đặt món online",
      scriptTitle: "Đặt món online",
      title: "Giảm",
      discount: "10%",
      desc: "Đặt món nhanh chóng qua website và nhận ưu đãi hấp dẫn.",
      conditions: [
        "Áp dụng khi đặt qua website",
        "Thanh toán online",
        "Không áp dụng kèm ưu đãi khác",
      ],
    },
  ];
  // Ưu đãi sắp tới
  const upcomingDeals = [
    {
      id: "national-day",
      icon: <Flag />,
      title: "Quốc khánh 2/9",
      date: "01/09 - 04/09",
      desc: "Nhiều ưu đãi hấp dẫn đang chờ đón bạn!",
    },
    {
      id: "mid-autumn",
      icon: <MoonStar />,
      title: "Tết Trung thu",
      date: "14/08 - 17/08 ÂL",
      desc: "Đón trăng rằm - Nhận ngàn ưu đãi",
    },
    {
      id: "christmas",
      icon: <TreePine />,
      title: "Giáng sinh",
      date: "24/12 - 25/12",
      desc: "Mừng Giáng sinh - Rinh quà cực đỉnh",
    },
    {
      id: "lunar-new-year",
      icon: <PartyPopper />,
      title: "Tết Nguyên Đán",
      date: "10/01 - 15/01 ÂL",
      desc: "Khai xuân rộn ràng - Ưu đãi ngập tràn",
    },
  ];
  const banner = bannerDeals[currentBanner];
  // Chức năng chuyển banner
  const handlePrevBanner = () => {
    setCurrentBanner((prev) =>
      prev === 0 ? bannerDeals.length - 1 : prev - 1,
    );
  };

  const handleNextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % bannerDeals.length);
  };
  return (
    <div className="min-h-screen bg-[#fbf7ec] text-green-950">
      <main className="max-w-[1500px] mx-auto px-4 md:px-6 py-10">
        {/* HERO PROMO */}
        <section
          className={`relative h-[315px] sm:h-[380px] md:h-[500px] overflow-hidden rounded-[22px] md:rounded-[30px] shadow-xl transition-all duration-1000 ease-in-out ${
            isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
          }`}
        >
          <img
            src={banner.image}
            alt={banner.scriptTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* lớp phủ */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.12) 35%, rgba(0,0,0,0) 65%)",
            }}
          ></div>
          <div
            key={banner.id}
            className="relative z-20 h-full w-full max-w-[850px] px-7 sm:px-10 md:pl-28 lg:pl-36 md:pr-8 flex items-center"
          >
            <div className="w-full">
              <span className="w-fit inline-flex items-center gap-2 border border-[#d6a84f] text-[#f6d47a] px-4 py-2 rounded-lg text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wide">
                <Star className="w-4 h-4" />
                {banner.label}
              </span>

              <p
                className="mt-3 text-3xl sm:text-5xl md:text-6xl text-white leading-none"
                style={{ fontFamily: "'Great Vibes', cursive" }}
              >
                {banner.scriptTitle}
              </p>

              <h1 className="mt-2 text-4xl sm:text-6xl md:text-7xl font-black uppercase leading-none text-white">
                {banner.title}{" "}
                <span className="text-[#f6d47a]">{banner.discount}</span>
              </h1>

              <p className="mt-5 text-sm sm:text-base md:text-lg text-white/90 leading-relaxed max-w-[680px]">
                {banner.desc}
              </p>

              <div
                className="hidden sm:grid gap-3 md:gap-5 mt-5 text-[11px] sm:text-xs md:text-sm text-white/90 max-w-[720px]"
                style={{
                  gridTemplateColumns: `repeat(${banner.conditions.length}, minmax(0, 1fr))`,
                }}
              >
                {banner.conditions.map((text, index) => (
                  <div key={text} className="flex items-start gap-2">
                    {index === 0 && (
                      <CalendarDays className="w-5 h-5 text-[#f6d47a] shrink-0" />
                    )}
                    {index === 1 && (
                      <Utensils className="w-5 h-5 text-[#f6d47a] shrink-0" />
                    )}
                    {index === 2 && (
                      <Gift className="w-5 h-5 text-[#f6d47a] shrink-0" />
                    )}
                    <span className="leading-snug">{text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate(`/deals/${banner.id}`)}
                className="mt-5 sm:mt-8 w-[190px] sm:w-[230px] md:w-[260px] h-11 sm:h-[52px] md:h-14 bg-[#f6c441] text-green-950 rounded-xl text-xs sm:text-sm md:text-base font-black hover:bg-[#d6a84f] hover:scale-105 transition"
              >
                Xem chi tiết ưu đãi →
              </button>
            </div>
          </div>
          {/* // Nút điều hướng banner */}
          <button
            type="button"
            onClick={handlePrevBanner}
            className="hidden sm:flex absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/35 text-white items-center justify-center text-3xl font-bold hover:bg-black/55 transition"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNextBanner}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/35 text-white flex items-center justify-center text-3xl font-bold hover:bg-black/55 transition"
          >
            ›
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {bannerDeals.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentBanner(index)}
                className={`h-2 rounded-full transition-all ${
                  currentBanner === index
                    ? "w-8 bg-[#f6c441]"
                    : "w-2 bg-white/50"
                }`}
              ></button>
            ))}
          </div>
        </section>

        {/* ƯU ĐÃI ĐANG DIỄN RA */}
        <SectionTitle
          title="Ưu đãi đang diễn ra"
          subtitle="Nhiều chương trình hấp dẫn dành riêng cho bạn"
        />

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            {
              id: "family-combo",
              image: comboCardImg,
              icon: <Users />,
              title: "Combo gia đình",
              discount: "20%",
              desc: "Ưu đãi đặc biệt dành cho những bữa ăn sum vầy.",
            },
            {
              id: "birthday",
              image: birthdayCardImg,
              icon: <Cake />,
              title: "Sinh nhật vui vẻ",
              discount: "15%",
              desc: "Giảm ngay 15% tổng hóa đơn cho bàn tiệc sinh nhật.",
            },
            {
              id: "online-order",
              image: onlineCardImg,
              icon: <PhoneCall />,
              title: "Đặt món online",
              discount: "10%",
              desc: "Tiện lợi, nhanh chóng, ưu đãi hơn khi đặt qua website.",
            },
            {
              id: "booking-special",
              image: bookingCardImg,
              icon: <CalendarDays />,
              title: "Đặt bàn trước",
              discount: "Ưu đãi đặc biệt",
              desc: "Đặt bàn trước để nhận nhiều ưu đãi hấp dẫn.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="relative h-[360px] sm:h-[460px] lg:h-[520px] rounded-3xl border border-[#eadfcd] shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-md transition group"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
              />
              {/* Lớp phủ */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-transparent"></div>

              <div className="relative z-10 h-full p-5 sm:p-6 flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/20 backdrop-blur text-[#f6d47a] flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>

                  <h3 className="font-black text-base text-white drop-shadow">
                    {item.title}
                  </h3>
                </div>

                <div className="h-[70px] sm:h-[90px] flex items-center">
                  <h2
                    className={`font-black uppercase leading-tight ${
                      item.discount === "Ưu đãi đặc biệt"
                        ? "text-2xl sm:text-3xl text-green-700"
                        : "text-3xl sm:text-4xl text-green-700"
                    }`}
                  >
                    {item.discount === "Ưu đãi đặc biệt" ? (
                      item.discount
                    ) : (
                      <>
                        Giảm{" "}
                        <span className="text-4xl sm:text-5xl text-[#f6d47a]">
                          {item.discount}
                        </span>
                      </>
                    )}
                  </h2>
                </div>

                <div className="w-8 h-[2px] bg-[#f6d47a] mt-0 mb-1"></div>

                <p className="text-xs sm:text-sm text-white/90 leading-relaxed line-clamp-2">
                  {item.desc}
                </p>

                <div className="mt-auto pt-6">
                  <button
                    onClick={() => navigate(`/deals/${item.id}`)}
                    className="w-full h-10 sm:h-12 bg-black/25 border border-white/30 text-white px-4 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#f6c441] hover:text-green-950 hover:border-[#f6c441] transition"
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ĐIỀU KIỆN ÁP DỤNG */}
        <SectionTitle title="Điều kiện áp dụng" />

        <section className="bg-white border border-[#eadfcd] rounded-3xl shadow-sm p-4 sm:p-6 grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            {
              icon: <Users />,
              title: "Combo gia đình",
              items: [
                "Áp dụng cho hóa đơn từ 2.000.000đ",
                "Không áp dụng kèm ưu đãi khác",
                "Không áp dụng ngày lễ, Tết",
              ],
            },
            {
              icon: <PhoneCall />,
              title: "Đặt món online",
              items: [
                "Áp dụng khi đặt qua website",
                "Thanh toán online",
                "Không áp dụng kèm ưu đãi khác",
              ],
            },
            {
              icon: <Cake />,
              title: "Sinh nhật",
              items: [
                "Áp dụng khi đặt bàn trước",
                "Xuất trình giấy tờ tùy thân",
                "Không áp dụng kèm ưu đãi khác",
              ],
            },
            {
              icon: <CalendarDays />,
              title: "Đặt bàn trước",
              items: [
                "Áp dụng cho nhóm từ 6 người trở lên",
                "Đặt trước tối thiểu 2 giờ",
                "Không áp dụng kèm ưu đãi khác",
              ],
            },
          ].map((box) => (
            <div key={box.title} className="flex gap-4">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-green-50 text-green-900 flex items-center justify-center shrink-0">
                {box.icon}
              </div>

              <div>
                <h3 className="font-black text-green-900 mb-3">{box.title}</h3>
                <div className="space-y-2">
                  {box.items.map((text) => (
                    <p
                      key={text}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle className="w-4 h-4 text-[#d6a84f] shrink-0 mt-0.5" />
                      {text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>
        {/* “Ưu đãi sắp diễn ra” */}
        <SectionTitle title="Ưu đãi sắp diễn ra" />
        <section className="relative mb-10">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              0: {
                slidesPerView: 1.1,
                spaceBetween: 14,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
            className="deal-swiper pb-10"
          >
            {upcomingDeals.map((item) => (
              <SwiperSlide key={item.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/deals/${item.id}`)}
                  className="w-full h-[150px] text-left bg-white border border-[#eadfcd] rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-md hover:border-[#d6a84f] transition group"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[#fbf0dc] text-green-900 flex items-center justify-center shrink-0 group-hover:bg-green-900 group-hover:text-[#f6d47a] transition">
                    {item.icon}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-black text-green-900 group-hover:text-[#b88935] transition line-clamp-1">
                      {item.title}
                    </h3>

                    <p className="text-sm font-bold text-gray-600 mt-1">
                      {item.date}
                    </p>

                    <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>

                    <p className="text-xs font-black text-green-900 mt-3 opacity-0 group-hover:opacity-100 transition">
                      Xem chi tiết →
                    </p>
                  </div>
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* CTA */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* ĐẶT BÀN */}
          <div
            className="relative overflow-hidden rounded-3xl min-h-[230px] md:min-h-[300px] p-6 md:p-10 flex flex-col justify-center"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(0,50,25,.95) 0%, rgba(0,50,25,.82) 45%, rgba(0,50,25,.35) 100%), url(${restaurantSpace})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Tiêu đề */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#f6c441] flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-[#f6c441]" />
              </div>

              <h2 className="text-2xl md:text-4xl font-black text-white">
                Đặt bàn ngay
              </h2>
            </div>

            <div className="w-16 h-1 bg-[#f6c441] rounded-full mt-4 mb-5" />

            <p className="text-white/85 max-w-md leading-relaxed">
              Giữ chỗ nhanh chóng cho gia đình, bạn bè và các buổi tiệc sinh
              nhật, liên hoan tại Dê Hương Sơn.
            </p>

            <button
              onClick={() => navigate("/booking")}
              className="mt-7 w-fit bg-[#f6c441] hover:bg-[#ffd35a] hover:scale-105 transition-all duration-300 px-7 py-3 rounded-xl font-bold text-green-950 shadow-lg"
            >
              Đặt bàn ngay →
            </button>
          </div>

          {/* ĐẶT MÓN */}
          <div
            className="relative overflow-hidden rounded-3xl min-h-[300px] p-8 md:p-10 flex flex-col justify-center"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(0,50,25,.95) 0%, rgba(0,50,25,.82) 45%, rgba(0,50,25,.35) 100%), url(${goatFood})`,
              backgroundSize: "cover",
              backgroundPosition: "right center",
            }}
          >
            {/* Tiêu đề */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#f6c441] flex items-center justify-center">
                <Utensils className="w-6 h-6 text-[#f6c441]" />
              </div>

              <h2 className="text-2xl md:text-4xl font-black text-white">
                Đặt món ngay
              </h2>
            </div>

            <div className="w-16 h-1 bg-[#f6c441] rounded-full mt-4 mb-5" />

            <p className="text-white/85 max-w-md leading-relaxed">
              Khám phá thực đơn đặc sản dê Hương Sơn với những món ăn đậm vị núi
              rừng Hà Tĩnh.
            </p>

            <button
              onClick={() => navigate("/menu")}
              className="mt-7 w-fit bg-white hover:bg-[#fff7dc] hover:scale-105 transition-all duration-300 px-7 py-3 rounded-xl font-bold text-green-900 shadow-lg"
            >
              Xem thực đơn →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
// COMPONENT SECTION TITLE
function SectionTitle({ title, subtitle }) {
  return (
    <section className="text-center my-8">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-green-900 uppercase leading-tight">
        {title}
      </h2>

      {subtitle && <p className="text-gray-500 text-sm mt-2">{subtitle}</p>}

      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="w-20 sm:w-28 h-px bg-[#d6a84f]"></div>

        <img
          src={goatIcon}
          alt="Dê Hương Sơn"
          className="w-8 h-8 object-contain"
        />

        <div className="w-20 sm:w-28 h-px bg-[#d6a84f]"></div>
      </div>
    </section>
  );
}
export default DealsPage;
