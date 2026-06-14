import { getCurrentUserSession } from "@/modules/auth/services/current-user-session";
import { paymentProofUploadSchema } from "@/modules/payments/schemas/payment-upload";
import { createUserPaymentUseCases } from "@/core/infrastructure/http/user-payment-factory";
import { errorResponse, handleApiError, successResponse } from "@/core/infrastructure/http/route-response";

const parseUploadFormData = async (request: Request) => {
  const formData = await request.formData();

  return {
    bookingId: String(formData.get("bookingId") || ""),
    paymentTermId: String(formData.get("paymentTermId") || ""),
    amount: formData.get("amount"),
    file: formData.get("file"),
    note: formData.get("note") ? String(formData.get("note")) : undefined,
  };
};

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await getCurrentUserSession();

    if (!session) {
      return errorResponse(401, "Unauthorized: user session not found");
    }

    const { id } = await context.params;
    const rawPayload = await parseUploadFormData(request);
    const parsed = paymentProofUploadSchema.safeParse(rawPayload);

    if (!parsed.success) {
      return errorResponse(400, "Invalid upload payload", parsed.error.flatten());
    }

    if (parsed.data.paymentTermId !== id) {
      return errorResponse(400, "Termin pembayaran tidak cocok dengan route");
    }

    const { uploadUserPaymentProofUseCase } = createUserPaymentUseCases();
    const data = await uploadUserPaymentProofUseCase.execute(
      {
        bookingId: parsed.data.bookingId,
        paymentTermId: id,
        amount: parsed.data.amount,
        note: parsed.data.note,
        file: parsed.data.file,
      },
      session
    );

    return successResponse(data, 201, "Success");
  } catch (error) {
    return handleApiError(error);
  }
}
