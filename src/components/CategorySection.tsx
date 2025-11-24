"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Smartphone, Headphones, Watch, Tablet, Camera, Laptop } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  count: number;
  icon?: string; // Font Awesome icon class (e.g., "fa-solid fa-microchip")
}

interface CategorySectionProps {
  categories: Category[];
}

const categoryIcons: Record<string, any> = {
  موبایل: Smartphone,
  گوشی: Smartphone,
  هدفون: Headphones,
  ساعت: Watch,
  تبلت: Tablet,
  دوربین: Camera,
  "لپ\u200Cتاپ": Laptop,
  لپتاپ: Laptop,
};

export default function CategorySection({ categories }: CategorySectionProps) {
  const getIcon = (name: string) => {
    for (const [key, Icon] of Object.entries(categoryIcons)) {
      if (name.includes(key)) {
        return Icon;
      }
    }
    return Smartphone;
  };

  // Extract Font Awesome icon class from category meta_data or icon field
  const getFontAwesomeIcon = (category: Category): string | null => {
    // Check if icon is directly provided
    if (category.icon) {
      return category.icon;
    }
    return null;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            دسته‌بندی محصولات
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const Icon = getIcon(category.name);
            const fontAwesomeIcon = getFontAwesomeIcon(category);
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  href={`/categories/${category.slug}`}
                  className="group block bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      ) : fontAwesomeIcon ? (
                        <i
                          className={`${fontAwesomeIcon} text-blue-600 group-hover:scale-110 transition-transform duration-300`}
                          style={{ fontSize: "48px" }}
                        />
                      ) : (
                        <Icon
                          size={48}
                          className="text-blue-600 group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">{category.count} محصول</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

