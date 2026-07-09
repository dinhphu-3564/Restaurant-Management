import {
  Utensils,
  Salad,
  Soup,
  Flame,
  CookingPot,
  Beef,
  CircleDot,
  Gem,
  Circle,
  Fish,
  Drumstick,
  Coffee,
  Leaf,
  Waves,
} from "lucide-react";
export const ICON_MAP = {
  Utensils,
  Salad,
  Soup,
  Flame,
  CookingPot,
  Beef,
  CircleDot,
  Gem,
  Circle,
  Fish,
  Drumstick,
  Coffee,
  Leaf,
  Waves,
};

export const categories = [
  {
    name: "Tất cả món",
    icon: Utensils,
  },
  {
    name: "Món khai vị",
    icon: Salad,
  },
  {
    name: "Dê hấp",
    icon: Soup,
  },
  {
    name: "Dê nướng",
    icon: Flame,
  },
  {
    name: "Dê xào",
    icon: CookingPot,
  },
  {
    name: "Dê lẩu",
    icon: Soup,
  },
  {
    name: "Sườn dê",
    icon: Beef,
  },
  {
    name: "Dồi dê",
    icon: CircleDot,
  },
  {
    name: "Ngọc dương",
    icon: Gem,
  },
  {
    name: "Lòng dê",
    icon: Circle,
  },
  {
    name: "Món hầm",
    icon: CookingPot,
  },
  {
    name: "Món khác",
    icon: Utensils,
    children: ["Hải sản", "Bò", "Heo", "Gà", "Vịt", "Ếch", "Cá", "Món chay"],
  },
  {
    name: "Đồ uống",
    icon: Coffee,
  },
];

export const categoryIconMap = {
  "Tất cả món": Utensils,
  "Món khai vị": Salad,
  "Dê hấp": Soup,
  "Dê nướng": Flame,
  "Dê xào": CookingPot,
  "Dê lẩu": Soup,
  "Sườn dê": Beef,
  "Dồi dê": CircleDot,
  "Ngọc dương": Gem,
  "Lòng dê": Circle,
  "Món hầm": CookingPot,
  "Món khác": Utensils,
  "Hải sản": Waves,
  Bò: Beef,
  Heo: Beef,
  Gà: Drumstick,
  Vịt: Drumstick,
  Ếch: CircleDot,
  Cá: Fish,
  "Món chay": Leaf,
  "Đồ uống": Coffee,
};
