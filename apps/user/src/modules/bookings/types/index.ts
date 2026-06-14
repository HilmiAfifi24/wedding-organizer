import type { PublicVendorDetailDTO, PublicVendorServiceItemDTO } from "@/modules/vendors/types";
import type {
  CreateUserBookingInput,
  UserBookingDetailDTO,
  UserBookingListItemDTO,
} from "@/core/domain/repositories";

export type BookingFormVendor = Pick<
  PublicVendorDetailDTO,
  | "id"
  | "businessName"
  | "categoryName"
  | "city"
  | "province"
  | "coverImageUrl"
  | "logoUrl"
  | "startingPrice"
  | "averageRating"
  | "totalReviews"
>;

export type BookingFormService = PublicVendorServiceItemDTO;

export interface CreateBookingFormValues {
  vendorId: string;
  serviceId: string;
  eventDate: string;
  eventLocation: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  guestCount?: number;
  notes?: string;
  specialRequest?: string;
}

export interface CreateBookingApiPayload extends Omit<CreateUserBookingInput, "eventDate"> {
  eventDate: string;
}

export interface BookingFormProps {
  vendor: BookingFormVendor;
  services: BookingFormService[];
  selectedServiceId?: string;
  initialCustomer: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  };
}

export type { UserBookingDetailDTO, UserBookingListItemDTO };
