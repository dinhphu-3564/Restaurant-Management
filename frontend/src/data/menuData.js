import deTaiChanh from "../assets/images/menu/de-tai-chanh.jpg";
import deNuongTang from "../assets/images/menu/de-nuong-tang.jpg";
import deXaoLan from "../assets/images/menu/de-xao-lan.jpg";
import lauDe from "../assets/images/menu/lau-de.jpg";
import deHapTiaTo from "../assets/images/menu/de-hap-tia-to.jpg";
import suonDeNuong from "../assets/images/menu/suon-de-nuong.jpg";

export const dishes = [
  {
    id: 1,
    name: "Dê tái chanh",
    description: "Thịt dê tươi tái chanh, thơm ngon, đậm vị.",
    price: "129.000đ",
    category: "Món khai vị",
    image: deTaiChanh,
    status: "available",
  },
  {
    id: 2,
    name: "Dê nướng tảng",
    description: "Thịt dê nướng tảng ướp gia vị đặc biệt.",
    price: "399.000đ",
    category: "Dê nướng",
    image: deNuongTang,
    status: "low",
  },
  {
    id: 3,
    name: "Dê xào lăn",
    description: "Thịt dê xào cùng sả, ớt, hành tây, thơm nồng.",
    price: "289.000đ",
    category: "Dê xào",
    image: deXaoLan,
    status: "available",
  },
  {
    id: 4,
    name: "Lẩu dê Hương Sơn",
    description: "Nước lẩu đậm đà từ xương dê, ăn kèm rau tươi.",
    price: "399.000đ",
    category: "Dê lẩu",
    image: lauDe,
    status: "soldout",
  },
  {
    id: 5,
    name: "Dê hấp tía tô",
    description: "Thịt dê hấp cùng lá tía tô, giữ trọn vị ngọt tự nhiên.",
    price: "399.000đ / đĩa",
    category: "Dê hấp",
    image: deHapTiaTo,
    status: "available",
  },
  {
    id: 6,
    name: "Sườn dê nướng",
    description: "Sườn dê nướng thơm lừng, mềm ngọt tự nhiên.",
    price: "449.000đ / đĩa",
    category: "Dê nướng",
    image: suonDeNuong,
    status: "soldout",
  },
];
