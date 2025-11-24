"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  buttonText: string;
}

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch("/api/hero-slides");
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setSlides(data.data);
      } else {
        // Fallback slides
        setSlides([
          {
            id: 1,
            title: "جدیدترین محصولات",
            subtitle: "بهترین قیمت و کیفیت",
            image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=600&fit=crop",
            link: "/products",
            buttonText: "مشاهده محصولات",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching hero slides:", error);
      // Fallback slides
      setSlides([
        {
          id: 1,
          title: "جدیدترین محصولات",
          subtitle: "بهترین قیمت و کیفیت",
          image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=600&fit=crop",
          link: "/products",
          buttonText: "مشاهده محصولات",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (isLoading || slides.length === 0) {
    return (
      <div className="relative h-[600px] md:h-[700px] overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] md:h-[700px] overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <AnimatePresence mode="wait">
        {slides.map(
          (slide, index) =>
            index === currentSlide && (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div className="container mx-auto px-4 h-full flex items-center">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full">
                    {/* Content */}
                    <div className="text-white z-10">
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-6xl font-bold mb-4"
                      >
                        {slide.title}
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl md:text-2xl text-gray-300 mb-8"
                      >
                        {slide.subtitle}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Link
                          href={slide.link}
                          className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                        >
                          {slide.buttonText}
                        </Link>
                      </motion.div>
                    </div>

                    {/* Image */}
                    <div className="relative h-[400px] md:h-[500px] hidden md:block">
                      <div className="absolute inset-0 bg-gradient-to-l from-transparent to-blue-900/50 z-10"></div>
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        sizes="100vw"
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-20"
        aria-label="Previous slide"
      >
        <ChevronRight size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-20"
        aria-label="Next slide"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 space-x-reverse z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

