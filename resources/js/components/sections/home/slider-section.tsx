import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

export const SliderItemSection = ({ item }: any) => {
    return (
        <div className="relative h-75 w-full overflow-hidden md:h-100">
            <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 flex flex-col justify-end bg-black/40 p-6">
                <h2 className="text-xl font-bold text-white md:text-2xl">
                    {item.title}
                </h2>
                <p className="text-sm text-white md:text-base">
                    {item.description}
                </p>
            </div>
        </div>
    );
};

export const SliderSection = () => {
    const sliders = [
        {
            id: 1,
            title: 'Super Gizi Qurban',
            description: 'Berbagi gizi untuk yatim dan dhuafa',
            image: 'https://picsum.photos/1980/1080',
        },
        {
            id: 2,
            title: 'Program Pendidikan',
            description: 'Membantu pendidikan anak yatim',
            image: 'https://picsum.photos/1980/1080',
        },
        {
            id: 3,
            title: 'Program Kesehatan',
            description: 'Akses kesehatan untuk yatim',
            image: 'https://picsum.photos/1980/1080',
        },
    ];

    return (
        <div className="w-full">
            <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                spaceBetween={20}
                slidesPerView={1}
                loop={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                // pagination={{ clickable: true }}
                // navigation={true}
                // className="rounded-2xl"
            >
                {sliders.map((item) => (
                    <SwiperSlide key={item.id}>
                        <SliderItemSection item={item} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};
