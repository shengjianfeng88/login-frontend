import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import slide_image_1 from "@/assets/home/img_1.jpg";
import slide_image_2 from "@/assets/home/img_2.jpg";
import slide_image_3 from "@/assets/home/img_3.jpg";
import slide_image_4 from "@/assets/home/img_4.jpg";
// import slide_image_5 from "@/assets/home/img_5.jpg";
// import slide_image_6 from "@/assets/home/img_6.jpg";
// import slide_image_7 from "@/assets/home/img_7.jpg";

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';
import Card from "./Card";

const data = [
  {
    id: 1,
    price: "200",
    currency: "USD",
    description: "Updating your wardrobe? Get cashback.",
    image: slide_image_1,
  },
  {
    id: 2,
    price: "200",
    currency: "EUR",
    description: "Updating your wardrobe? Get cashback.",
    image: slide_image_2,
  },
  {
    id: 3,
    price: "200",
    currency: "GBP",
    description: "Updating your wardrobe? Get cashback.",
    image: slide_image_3,
  },
  {
    id: 4,
    price: "200",
    currency: "JPY",
    description: "Updating your wardrobe? Get cashback.",
    image: slide_image_4,
  },

];
const MySwiper = () => {
  return (
    <Swiper
    effect={'coverflow'}
    grabCursor={true}
    centeredSlides={true}
    loop={true}
    slidesPerView={'auto'}
    autoplay={{
      delay: 2500,
      disableOnInteraction: false,
    }}
    coverflowEffect={{
      rotate: 0,
      stretch: 0,
      depth: 80,
      modifier: 2,
    }}
    pagination={{ el: '.swiper-pagination', clickable: true }}
    navigation={{
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    }}
    modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
    className="swiper_container"
    >
      {data.map((item) => (
         <SwiperSlide>
         <Card image={item.image} price={item.price} currency={item.currency} description={item.description}/>
       </SwiperSlide>
      ))}
        <div className="slider-controler">

          <div className="swiper-pagination"></div>
        </div>
      </Swiper>
  );
};

export default React.memo(MySwiper);
