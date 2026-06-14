import "server-only";

import { MediaType } from "@wo/shared-types";

import {
  calculateAverageRating,
  calculateStartingPrice,
  getVendorDisplayName,
  getVendorShortDescription,
  sortPublicVendors,
} from "@/core/domain/entities/public-vendor";
import type {
  PublicVendorDetailDTO,
  PublicVendorDiscoveryQuery,
  PublicVendorFilterOption,
  PublicVendorListItemDTO,
  PublicVendorListResultDTO,
  PublicVendorPortfolioItemDTO,
  PublicVendorRepository,
  PublicVendorReviewItemDTO,
  PublicVendorServiceItemDTO,
} from "@/core/domain/repositories";

import { prisma } from "../prisma";

const publicVendorVisibilityWhere = {
  status: "APPROVED" as const,
  deletedAt: null,
};

const buildSearchWhere = (query: PublicVendorDiscoveryQuery) => ({
  ...(query.search
    ? {
        OR: [
          { name: { contains: query.search, mode: "insensitive" as const } },
          { businessName: { contains: query.search, mode: "insensitive" as const } },
          { city: { contains: query.search, mode: "insensitive" as const } },
          { category: { name: { contains: query.search, mode: "insensitive" as const } } },
        ],
      }
    : {}),
  ...(query.categoryId ? { categoryId: query.categoryId } : {}),
  ...(query.city ? { city: { equals: query.city, mode: "insensitive" as const } } : {}),
});

const mapCategoryOptions = (items: Array<{ id: string; name: string }>): PublicVendorFilterOption[] =>
  items.map((item) => ({
    value: item.id,
    label: item.name,
  }));

const mapCityOptions = (items: Array<{ city: string | null }>): PublicVendorFilterOption[] =>
  items
    .filter((item): item is { city: string } => Boolean(item.city?.trim()))
    .map((item) => ({
      value: item.city,
      label: item.city,
    }));

const mapPublicVendorCard = (vendor: {
  id: string;
  name: string;
  businessName: string | null;
  description: string | null;
  categoryId: string | null;
  city: string | null;
  province: string | null;
  coverImageUrl: string | null;
  logoUrl: string | null;
  createdAt: Date;
  category: {
    id: string;
    name: string;
  } | null;
  services: Array<{ price: number }>;
  reviews: Array<{ rating: number }>;
  _count: {
    bookings: number;
  };
}): PublicVendorListItemDTO => {
  const startingPrice = calculateStartingPrice(vendor.services);
  const averageRating = calculateAverageRating(vendor.reviews);
  const totalReviews = vendor.reviews.length;

  return {
    id: vendor.id,
    businessName: getVendorDisplayName(vendor),
    categoryId: vendor.categoryId,
    categoryName: vendor.category?.name ?? null,
    city: vendor.city,
    province: vendor.province,
    coverImageUrl: vendor.coverImageUrl,
    logoUrl: vendor.logoUrl,
    averageRating,
    totalReviews,
    startingPrice,
    shortDescription: getVendorShortDescription(vendor.description),
    bookingCount: vendor._count.bookings,
    createdAt: vendor.createdAt,
  };
};

const mapPublicVendorDetail = (vendor: {
  id: string;
  name: string;
  businessName: string | null;
  description: string | null;
  categoryId: string | null;
  city: string | null;
  province: string | null;
  businessAddress: string | null;
  location: string | null;
  priceRange: string | null;
  coverImageUrl: string | null;
  logoUrl: string | null;
  contactInfo: string | null;
  phoneNumber: string | null;
  whatsappNumber: string | null;
  website: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  createdAt: Date;
  category: {
    id: string;
    name: string;
  } | null;
  services: Array<{ price: number }>;
  reviews: Array<{ rating: number }>;
  _count: {
    bookings: number;
  };
}): PublicVendorDetailDTO => ({
  id: vendor.id,
  businessName: getVendorDisplayName(vendor),
  description: vendor.description,
  categoryId: vendor.categoryId,
  categoryName: vendor.category?.name ?? null,
  city: vendor.city,
  province: vendor.province,
  businessAddress: vendor.businessAddress,
  location: vendor.location,
  priceRange: vendor.priceRange,
  coverImageUrl: vendor.coverImageUrl,
  logoUrl: vendor.logoUrl,
  averageRating: calculateAverageRating(vendor.reviews),
  totalReviews: vendor.reviews.length,
  startingPrice: calculateStartingPrice(vendor.services),
  bookingCount: vendor._count.bookings,
  contact: {
    contactInfo: vendor.contactInfo,
    phoneNumber: vendor.phoneNumber,
    whatsappNumber: vendor.whatsappNumber,
    website: vendor.website,
    instagramUrl: vendor.instagramUrl,
    tiktokUrl: vendor.tiktokUrl,
    facebookUrl: vendor.facebookUrl,
    youtubeUrl: vendor.youtubeUrl,
  },
  createdAt: vendor.createdAt,
});

const mapPortfolioItem = (item: {
  id: string;
  vendorId: string;
  title: string | null;
  description: string | null;
  mediaUrl: string;
  mediaType: string;
  createdAt: Date;
  updatedAt: Date;
}): PublicVendorPortfolioItemDTO => ({
  ...item,
  mediaType: item.mediaType as MediaType,
});

const mapReviewItem = (item: {
  id: string;
  bookingId: string;
  vendorId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    name: string | null;
  };
}): PublicVendorReviewItemDTO => ({
  id: item.id,
  bookingId: item.bookingId,
  vendorId: item.vendorId,
  rating: item.rating,
  comment: item.comment,
  reviewerName: item.user.name,
  createdAt: item.createdAt,
});

export class PrismaPublicVendorRepository implements PublicVendorRepository {
  async listPublicVendors(query: PublicVendorDiscoveryQuery): Promise<PublicVendorListResultDTO> {
    const where = {
      ...publicVendorVisibilityWhere,
      ...buildSearchWhere(query),
    };

    const [vendors, categories, cities] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          services: {
            where: {
              isActive: true,
            },
            select: {
              price: true,
            },
          },
          reviews: {
            where: {
              status: "VISIBLE",
              deletedAt: null,
            },
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      }),
      prisma.category.findMany({
        where: {
          vendors: {
            some: publicVendorVisibilityWhere,
          },
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.vendor.findMany({
        where: {
          ...publicVendorVisibilityWhere,
          city: {
            not: null,
          },
        },
        distinct: ["city"],
        select: {
          city: true,
        },
        orderBy: {
          city: "asc",
        },
      }),
    ]);

    const mapped = vendors
      .map(mapPublicVendorCard)
      .filter((item) => {
        if (typeof query.rating === "number" && item.averageRating < query.rating) {
          return false;
        }

        if (typeof query.priceMin === "number") {
          if (item.startingPrice === null || item.startingPrice < query.priceMin) {
            return false;
          }
        }

        if (typeof query.priceMax === "number") {
          if (item.startingPrice === null || item.startingPrice > query.priceMax) {
            return false;
          }
        }

        return true;
      })
      .map((item) => item);

    const sorted = sortPublicVendors(mapped, query.sortBy);
    const totalItems = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / query.pageSize));
    const safePage = Math.min(query.page, totalPages);
    const start = (safePage - 1) * query.pageSize;
    const items = sorted.slice(start, start + query.pageSize);

    return {
      items,
      page: safePage,
      pageSize: query.pageSize,
      totalItems,
      totalPages,
      filters: {
        categories: mapCategoryOptions(categories),
        cities: mapCityOptions(cities),
      },
    };
  }

  async getPublicVendorById(vendorId: string): Promise<PublicVendorDetailDTO | null> {
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        ...publicVendorVisibilityWhere,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        services: {
          where: {
            isActive: true,
          },
          select: {
            price: true,
          },
        },
        reviews: {
          where: {
            status: "VISIBLE",
            deletedAt: null,
          },
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    return vendor ? mapPublicVendorDetail(vendor) : null;
  }

  async listPublicVendorServices(vendorId: string): Promise<PublicVendorServiceItemDTO[] | null> {
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        ...publicVendorVisibilityWhere,
      },
      select: {
        services: {
          where: {
            isActive: true,
          },
          orderBy: [
            { price: "asc" },
            { createdAt: "desc" },
          ],
          select: {
            id: true,
            vendorId: true,
            name: true,
            description: true,
            price: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return vendor?.services ?? null;
  }

  async listPublicVendorPortfolio(
    vendorId: string
  ): Promise<PublicVendorPortfolioItemDTO[] | null> {
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        ...publicVendorVisibilityWhere,
      },
      select: {
        portfolio: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            vendorId: true,
            title: true,
            description: true,
            mediaUrl: true,
            mediaType: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return vendor ? vendor.portfolio.map(mapPortfolioItem) : null;
  }

  async listPublicVendorReviews(vendorId: string): Promise<PublicVendorReviewItemDTO[] | null> {
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        ...publicVendorVisibilityWhere,
      },
      select: {
        reviews: {
          where: {
            status: "VISIBLE",
            deletedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            bookingId: true,
            vendorId: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return vendor ? vendor.reviews.map(mapReviewItem) : null;
  }
}
