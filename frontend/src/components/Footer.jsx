import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, CalendarDays } from "lucide-react";
import goatIcon from "../assets/images/Icon_De.png";

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=100088682802201";

function Footer() {
  return (
    <footer className="bg-primary text-white">
      {/* FOOTER */}

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
              <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />

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
              <Phone className="w-5 h-5 text-secondary" />
              <a href="tel:0387136878" className="hover:text-white">
                038 713 6878
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-secondary" />
              <a
                href="mailto:dehuongsonn.ht@gmail.com"
                className="hover:text-white break-all"
              >
                dehuongsonn.ht@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-5">Giờ mở cửa</h3>

          <div className="space-y-4 text-sm text-white/80">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-secondary" />
              <span>08:00 - 22:00</span>
            </div>

            <div className="flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-secondary" />
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
  );
}

export default Footer;
