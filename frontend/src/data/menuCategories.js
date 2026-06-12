import { GiMeat, GiCampCookingPot, GiBarbecue } from "react-icons/gi";

import {
  PiBowlFoodLight,
  PiCookingPotLight,
  PiCoffeeLight,
} from "react-icons/pi";

import { TbSoup } from "react-icons/tb";

export const categories = [
  {
    name: "Tất cả món",
    icon: GiMeat,
  },

  {
    name: "Món khai vị",
    icon: TbSoup,
  },

  {
    name: "Dê hấp",
    icon: PiCookingPotLight,
  },

  {
    name: "Dê nướng",
    icon: GiBarbecue,
  },

  {
    name: "Dê xào",
    icon: PiBowlFoodLight,
  },

  {
    name: "Dê lẩu",
    icon: GiCampCookingPot,
  },

  {
    name: "Món khác",
    icon: PiBowlFoodLight,
    children: ["Hải sản", "Bò", "Heo", "Gà", "Vịt", "Ếch", "Cá", "Món chay"],
  },

  {
    name: "Đồ uống",
    icon: PiCoffeeLight,
  },
];
