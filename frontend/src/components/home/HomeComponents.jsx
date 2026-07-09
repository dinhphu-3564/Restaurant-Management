import React from "react";

export function SpaceItem({ image, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl overflow-hidden border border-[#eadfcd] bg-[#fffaf0] text-left hover:-translate-y-1 hover:shadow-xl transition"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
      </div>

      <div className="p-4">
        <h3 className="font-black text-green-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{desc}</p>
      </div>
    </button>
  );
}

export function Feature({ icon, title, text }) {
  return (
    <div className="p-4 md:p-6 border border-gray-100 text-center">
      <div className="w-10 h-10 md:w-13 md:h-13 rounded-full border border-green-800 flex items-center justify-center text-green-800 mb-2 md:mb-3 mx-auto">
        {icon}
      </div>

      <h3 className="font-bold mb-1 text-sm md:text-base leading-snug">
        {title}
      </h3>

      <p className="text-[13px] md:text-sm text-gray-600 leading-snug">
        {text}
      </p>
    </div>
  );
}

export function Info({ icon, title }) {
  return (
    <div>
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-2 md:mb-3 text-green-800">
        {icon}
      </div>
      <h3 className="font-bold text-green-900 text-[13px] md:text-sm leading-snug">
        {title}
      </h3>
      <p className="text-[11px] md:text-xs text-gray-600 mt-1">
        Chuẩn vị đặc trưng
      </p>
    </div>
  );
}

export function Why({ icon, title, text }) {
  return (
    <div className="px-1 md:px-3">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-green-800 flex items-center justify-center mx-auto mb-2 md:mb-3 text-green-800">
        {icon}
      </div>

      <h3 className="font-bold mb-1 text-[13px] md:text-sm leading-snug">
        {title}
      </h3>

      <p className="text-[11px] md:text-xs text-gray-600 leading-snug">
        {text}
      </p>
    </div>
  );
}

export function Promo({ title, discount, price, image, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white text-green-950 rounded-2xl p-4 mb-4 flex items-center gap-4 text-left hover:-translate-y-1 hover:shadow-xl transition group"
    >
      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-amber-100 shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
      </div>

      <div className="flex-1 min-w-0">
        <span className="bg-green-800 text-white px-3 py-1 rounded-full text-xs font-bold">
          {discount}
        </span>

        <h3 className="font-black mt-2 text-green-950 line-clamp-1">{title}</h3>

        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{desc}</p>

        <p className="font-black text-green-800 mt-2">{price}</p>
      </div>
    </button>
  );
}

export function Review({ name, text }) {
  return (
    <div className="bg-white rounded-2xl p-3 md:p-4 mb-3 md:mb-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="font-bold text-green-900 text-sm">{name}</p>
        <div className="text-yellow-500 text-xs md:text-sm">★★★★★</div>
      </div>

      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}

export function Service({ icon, title, text }) {
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
