import { z } from "zod";
import type { CartItem } from "@/contexts/CartContext";

const whatsappSchema = z.object({
  productName: z.string().trim().min(1).max(200),
  productCode: z.string().trim().max(100).optional(),
  color: z.string().trim().max(100).optional(),
  phoneNumber: z.string().trim().min(1).max(20),
});

export const generateWhatsAppLink = (
  phoneNumber: string,
  productName: string,
  productCode?: string,
  color?: string,
  productUrl?: string
): string => {
  // Validate inputs
  const validation = whatsappSchema.safeParse({
    productName,
    productCode,
    color,
    phoneNumber,
  });

  if (!validation.success) {
    console.error("Invalid WhatsApp parameters:", validation.error);
    throw new Error("Invalid parameters for WhatsApp link");
  }

  // Build message parts (plain text, encode once at the end)
  let message = `Hi, I'm interested in this product from your website:\n\n`;
  message += `*${productName}*\n`;

  if (productCode) {
    message += `Product Code: ${productCode}\n`;
  }

  if (color) {
    message += `Color: ${color}\n`;
  }

  if (productUrl) {
    message += `\nProduct Link: ${productUrl}\n`;
  }

  message += `\nCould you please provide more information?`;

  // Clean phone number (remove spaces, dashes, etc.)
  const cleanedPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");
  
  // Ensure phone number starts with +
  const formattedPhone = cleanedPhone.startsWith("+") ? cleanedPhone : `+${cleanedPhone}`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encoded}`;
};

export const generateCartWhatsAppMessage = (items: CartItem[]): string => {
  let message = `Hi, I'm interested in the following products from your website:\n\n`;
  let totalAmount = 0;
  
  items.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*\n`;
    if (item.code) {
      message += `   Code: ${item.code}\n`;
    }
    message += `   Quantity: ${item.quantity}\n`;
    // Only add price if it's greater than 0
    if (item.price > 0) {
      message += `   Price: Rs. ${!isNaN(Number(item.price)) ? Number(item.price).toFixed(2) : "N/A"}\n`;
      totalAmount += Number(item.price) * item.quantity;
    }
    message += `\n`;
  });

  message += `*Total Items: ${items.reduce((sum, item) => sum + item.quantity, 0)}*\n`;
  // Only add total amount if there's a price
  if (totalAmount > 0) {
    message += `*Total Amount: Rs. ${totalAmount.toFixed(2)}*\n\n`;
  } else {
    message += `\n`;
  }
  message += `Could you please provide more information and confirm availability?`;

  return message;
};
