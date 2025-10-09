import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PopularServiceCard } from '@/components/PopularServiceCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  city?: string;
  state?: string;
  rating?: number;
  image_url?: string;
  website?: string;
  product_images?: string[] | null;
  business_options?: string[] | null;
  starting_price?: string | null;
  license_expired_date?: string | null;
  products_catalog?: string | null;
  facebook_page?: string | null;
  tiktok_url?: string | null;
  phone?: string | null;
}

const PopularServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`*`)
        .eq('searchable_business', true)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error('Error fetching services:', error);
        return;
      }
      
      setServices(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Popular Services</h2>
          <div className="flex justify-center">
            <div className="text-muted-foreground">Loading services...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Popular Services</h2>
        
        <div className="hidden md:block bg-muted/30 rounded-2xl p-8 mx-4 overflow-hidden">
          <div className="relative">
            <Swiper
              modules={[Pagination]}
              pagination={{ 
                clickable: true,
                dynamicBullets: false,
                horizontalClass: 'swiper-pagination-horizontal',
                bulletClass: 'swiper-pagination-bullet',
                bulletActiveClass: 'swiper-pagination-bullet-active'
              }}
              spaceBetween={20}
              slidesPerView={'auto'}
              loop={false}
              grabCursor={true}
              centeredSlides={false}
              className="popular-businesses-swiper pb-12"
            >
            {services.map((service) => (
              <SwiperSlide key={service.id} className="!w-[260px] sm:!w-[290px]">
                <PopularServiceCard service={service} />
              </SwiperSlide>
            ))}
            
            <SwiperSlide key="discover-more" className="!w-[260px] sm:!w-[290px]">
              <Card className="group w-[290px] h-[555px] flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 mx-auto bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="relative overflow-hidden rounded-t-lg h-[290px] bg-gradient-to-br from-slate-700 to-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=290&h=290&fit=crop"
                    alt="Discover more services"
                    className="w-full h-[290px] opacity-30"
                    style={{ objectFit: 'none', objectPosition: 'top left' }}
                  />
                </div>
                
                <CardContent className="flex-1 p-3 flex flex-col justify-center items-center text-center">
                  <div className="space-y-4">
                    <h3 className="text-white text-lg font-bold">
                      Discover more services
                    </h3>
                    <p className="text-white/80 text-sm">
                      Explore hundreds of services and find exactly what you're looking for
                    </p>
                    <Button 
                      style={{ backgroundColor: '#EAB33A' }}
                      className="w-full h-10 text-black font-medium hover:opacity-90 transition-opacity"
                    >
                      Go Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </SwiperSlide>
           </Swiper>
          </div>
        </div>
        
        <div className="block md:hidden">
          <Swiper
            modules={[Pagination]}
            pagination={{ 
              clickable: true,
              dynamicBullets: false,
              horizontalClass: 'swiper-pagination-horizontal'
            }}
            spaceBetween={16}
            slidesPerView={'auto'}
            loop={false}
            grabCursor={true}
            centeredSlides={false}
            className="popular-businesses-swiper-mobile pb-12 pl-4"
            style={{ '--swiper-pagination-color': 'var(--primary)' } as React.CSSProperties}
          >
          {services.map((service) => (
            <SwiperSlide key={service.id} className="!w-[290px] first:!ml-0 last:!mr-4">
              <PopularServiceCard service={service} />
            </SwiperSlide>
          ))}
            
            <SwiperSlide key="discover-more-mobile" className="!w-[290px] last:!mr-4">
              <Card className="group w-[290px] h-[555px] flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 mx-auto bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="relative overflow-hidden rounded-t-lg h-[290px] bg-gradient-to-br from-slate-700 to-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=290&h=290&fit=crop"
                    alt="Discover more services"
                    className="w-full h-[290px] opacity-30"
                    style={{ objectFit: 'none', objectPosition: 'top left' }}
                  />
                </div>
                
                <CardContent className="flex-1 p-3 flex flex-col justify-center items-center text-center">
                  <div className="space-y-4">
                    <h3 className="text-white text-lg font-bold">
                      Discover more services
                    </h3>
                    <p className="text-white/80 text-sm">
                      Explore hundreds of services and find exactly what you're looking for
                    </p>
                    <Button 
                      style={{ backgroundColor: '#EAB33A' }}
                      className="w-full h-10 text-black font-medium hover:opacity-90 transition-opacity"
                    >
                      Go Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default PopularServices;
